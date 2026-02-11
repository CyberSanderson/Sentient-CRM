import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// 1. Initialize Firebase Admin (The Security Foundation)
if (!getApps().length) {
  try {
    const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!keyString) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
    const serviceAccount = JSON.parse(keyString);
    initializeApp({ credential: cert(serviceAccount) });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // 🛡️ SECURITY LAYER 1: Token Verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    // 🛡️ SECURITY LAYER 2: Usage Tracking
    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();
    const userData = userDoc.data() || { usageCount: 0, plan: 'free' };
    
    const isAdmin = email === 'lifeinnovations7@gmail.com'; 
    const limit = (userData.plan === 'pro' || isAdmin) ? 100 : 3;

    if ((userData.usageCount || 0) >= limit) {
        return res.status(403).json({ error: "Limit reached", limitReached: true });
    }

    // 🚀 THE BRAIN: Dynamic Identity Logic
    // We pull these from the frontend request
    const { prospectName, company, role, senderName, senderBusiness } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        // @ts-ignore
        tools: [{ googleSearch: {} }] 
    });

    const prompt = `
      You are a Sales Researcher writing a dossier for ${senderName}, who runs ${senderBusiness}.
      Target: ${prospectName} (${role} at ${company})

      TASK:
      1. Use Google Search to find a REAL hook about ${prospectName}.
      2. Write a 1-to-1 email from ${senderName} to ${prospectName}.

      ⚠️ RULES:
      - NO BRACKETS []. The email must be ready to send.
      - Describe how ${senderBusiness} specifically helps ${company}.
      - Use a professional, human tone. No "AI-speak."
      - If you can't find specific data, infer challenges based on the ${role} position.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Manual JSON cleaning (The "Surgeon" logic)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI Response");
    const jsonData = JSON.parse(jsonMatch[0]);

    return res.status(200).json(jsonData);

  } catch (error: any) {
    console.error('Security/Logic Error:', error);
    return res.status(500).json({ error: "Analysis Failed" });
  }
}