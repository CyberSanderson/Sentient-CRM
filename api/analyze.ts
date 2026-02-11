import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// 1. Initialize Firebase Admin
if (!getApps().length) {
  try {
    const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!keyString) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
    
    const serviceAccount = JSON.parse(keyString);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

const db = getFirestore();

// Helper: Sleep function for retries
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // A. CORS & Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ============================================================
    // 🔒 B. SECURITY: VERIFY TOKEN
    // ============================================================
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Missing Token');
    }
    const token = authHeader.split('Bearer ')[1];

    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    // C. CHECK OR CREATE USER (Auto-Heal)
    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
        console.log(`Creating missing user profile for ${email}`);
        await userRef.set({
            email: email || "unknown",
            usageCount: 0,
            plan: 'free',
            createdAt: new Date(),
            lastUsageDate: new Date().toISOString().split('T')[0]
        });
        userDoc = await userRef.get();
    }

    const userData = userDoc.data() || {};
    
    // Daily Reset Logic
    const today = new Date().toISOString().split('T')[0]; 
    if (userData.lastUsageDate !== today) {
        await userRef.update({ usageCount: 0, lastUsageDate: today });
        userData.usageCount = 0;
    }

    // 👑 ADMIN BYPASS (Put your email here)
    const isAdmin = email === 'your-email@gmail.com'; 

    // Plan Limits
    const isPro = userData.plan === 'pro' || userData.plan === 'premium' || isAdmin;
    const limit = isPro ? 100 : 3;

    if ((userData.usageCount || 0) >= limit) {
        return res.status(403).json({ 
            error: isPro ? "Daily limit of 100 reached." : "Daily free limit reached. Upgrade to Pro.",
            limitReached: true
        });
    }

    // D. RUN GEMINI AI
    const { prospectName, company, role } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ⚡ ENABLE GOOGLE SEARCH TOOL
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        // @ts-ignore - The SDK types haven't caught up to the new Search Tool yet, but this works!
        tools: [{ googleSearch: {} }] 
    });

    // 🚀 PROMPT WITH "LIVE SEARCH" INSTRUCTIONS
    const prompt = `
      You are an expert sales strategist with access to Google Search.
      Target: ${prospectName}
      Role: ${role}
      Company: ${company}

      TASK:
      Use Google Search to find REAL, RECENT information about this person. 
      Find actual podcast interviews, recent news articles, or awards.

      OUTPUT REQUIREMENTS (Strict JSON):
      
      1. "personality": A "Professional Communication Profile". 
         - BE ABSOLUTE. No "likely" or "appears". 
         - Mention specifics found in search (Nicknames like "Queen of AI", community roles, etc).
      
      2. "painPoints": 5 specific business challenges relevant to their specific company situation found in search results.
      
      3. "iceBreakers": 3 hyper-specific conversation starters.
         - MANDATORY: Reference a REAL podcast name, article title, or award name found via Google Search.
         - EXAMPLE: "I saw your interview on the 'Marketing School' podcast..." NOT "on [Podcast Name]".
      
      4. "emailDraft": A complete, ready-to-send email.
         - RULE: NO PLACEHOLDERS. NO BRACKETS like [Insert Name].
         - You must FILL IN the specific details found in search.
         - If you cannot find a specific podcast, reference a specific topic they post about on LinkedIn instead.
         - Keep it under 150 words.
      
      RETURN ONLY JSON. DO NOT USE MARKDOWN.
    `;

    let text = "";
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const result = await model.generateContent(prompt);
            text = result.response.text();
            break; 
        } catch (error: any) {
            attempts++;
            if (error.message?.includes('429') || error.message?.includes('Resource exhausted') || error.message?.includes('503')) {
                console.warn(`Rate limit hit. Retrying attempt ${attempts}/${maxAttempts}...`);
                if (attempts >= maxAttempts) throw new Error("Server busy. Please try again in 1 minute.");
                await sleep(2000 * attempts); 
            } else {
                throw error; 
            }
        }
    }

    // Clean up response
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // E. INCREMENT USAGE
    await userRef.update({ usageCount: FieldValue.increment(1) });

    return res.status(200).json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error('Backend Error:', error);
    return res.status(500).json({ error: error.message || 'System Error' });
  }
}