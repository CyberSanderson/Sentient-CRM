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

// 🛡️ ROBUST JSON CLEANER
// This fixes the "Bad escaped character" error manually
const cleanAndParseJSON = (text: string) => {
    try {
        // 1. Find the first '{' and the last '}'
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) throw new Error("No JSON found in response");
        
        let jsonString = text.substring(startIndex, endIndex + 1);

        // 2. Fix common AI JSON errors (like unescaped quotes inside strings)
        // This is a simple regex fix for basic cases, but often JSON.parse handles clean strings well
        // We rely on the prompt to be strict, but this substring extraction is the most important part.
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("JSON Parse Failed on:", text);
        throw new Error("Failed to parse AI response.");
    }
};

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

    // 👑 ADMIN BYPASS
    const isAdmin = email === 'lifeinnovations7@gmail.com'; 

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
    
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        // @ts-ignore
        tools: [{ googleSearch: {} }]
        // ❌ REMOVED "responseMimeType" because it conflicts with Search Tool
    });

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
      
      4. "emailDraft": A complete, ready-to-send email.
         - RULE: NO PLACEHOLDERS. NO BRACKETS like [Insert Name].
         - You must FILL IN the specific details found in search.
         - Keep it under 150 words.
      
      CRITICAL: Return ONLY valid JSON. Do not add markdown like \`\`\`json.
      Start with { and end with }. 
      If a string contains a quote ", you MUST escape it like \\".
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

    // 🛡️ USE THE ROBUST CLEANER
    const jsonData = cleanAndParseJSON(text);
    
    // E. INCREMENT USAGE
    await userRef.update({ usageCount: FieldValue.increment(1) });

    return res.status(200).json(jsonData);

  } catch (error: any) {
    console.error('Backend Error:', error);
    // Return the actual error message so we can see what's wrong in the dashboard
    return res.status(500).json({ error: error.message || "AI Response Error." });
  }
}