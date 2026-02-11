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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // A. CORS & Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ============================================================
    // 🔒 B. SECURITY: VERIFY TOKEN (DO NOT REMOVE)
    // This ensures only logged-in users can run this function.
    // ============================================================
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Missing Token');
    }
    const token = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;
    // ============================================================
    // 🔒 END SECURITY CHECK
    // ============================================================

    // C. CHECK OR CREATE USER (Auto-Heal Logic)
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
    const isAdmin = email === 'YOUR_EMAIL@gmail.com'; 

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
    
    // ⚡ FIX: Using 'gemini-pro' (The Universal Stable Model)
    // This fixes the [404 Not Found] error while keeping security intact.
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Act as a sales strategist. Analyze ${prospectName}, ${role} at ${company}. Return strict JSON with personality, painPoints (array), iceBreakers (array), emailDraft.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    // E. INCREMENT USAGE
    await userRef.update({ usageCount: FieldValue.increment(1) });

    return res.status(200).json(JSON.parse(text));

  } catch (error: any) {
    console.error('Backend Error:', error);
    if (error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
        return res.status(429).json({ error: "System busy. Please try again in 1 minute." });
    }
    return res.status(500).json({ error: error.message || 'System Error' });
  }
}