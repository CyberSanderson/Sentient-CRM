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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 🚀 THE MAGIC PROMPT FIX
    // We removed the word "Psychological" to avoid safety filters.
    // We added "Search your internal database" to force specific recall.
    const prompt = `
      You are a world-class sales researcher. 
      Target: ${prospectName}
      Role: ${role}
      Company: ${company}

      TASK:
      Search your internal knowledge base for podcasts, interviews, articles, and LinkedIn posts by this person.
      
      OUTPUT REQUIREMENTS (Strict JSON):
      1. "personality": A "Professional Communication Profile". 
         - MENTION SPECIFICS: If they have a nickname (e.g. "Queen of AI"), specific catchphrases, or communities they lead, YOU MUST INCLUDE THEM. 
         - Analyze their DISC profile based on their public content.
         - If no public info exists, infer from their job title.
      
      2. "painPoints": 5 specific business challenges relevant to their specific company situation.
      
      3. "iceBreakers": 3 hyper-specific conversation starters. 
         - Do NOT use generic "I saw your company". 
         - Reference specific interviews, articles, or recent news if available.
      
      4. "emailDraft": A short, punchy cold email using the insights above.
      
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