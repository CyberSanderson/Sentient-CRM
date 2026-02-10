import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// 1. Initialize Firebase Admin (Secure Modular Style)
// We use getApps() to safely check if it's already running
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

// Get DB instance safely
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // A. CORS & Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // B. SECURITY: Verify the User's Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Token' });
  }
  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the Clerk-generated Firebase token
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // C. CHECK LIMITS IN FIRESTORE
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).json({ error: 'User profile not found.' });
    }

    const userData = userDoc.data() || {};
    
    // Daily Reset Logic
    const today = new Date().toISOString().split('T')[0]; 
    if (userData.lastUsageDate !== today) {
        await userRef.update({ usageCount: 0, lastUsageDate: today });
        userData.usageCount = 0;
    }

    // Plan Limits
    const isPro = userData.plan === 'pro' || userData.plan === 'premium';
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
    if (!apiKey) return res.status(500).json({ error: 'Server Error: AI Key missing' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Act as a sales strategist. Analyze ${prospectName}, ${role} at ${company}. Return strict JSON with personality, painPoints (array), iceBreakers (array), emailDraft.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    // E. INCREMENT USAGE
    await userRef.update({ usageCount: FieldValue.increment(1) });

    return res.status(200).json(JSON.parse(text));

  } catch (error: any) {
    console.error('Backend Error:', error);
    return res.status(500).json({ error: 'System Error. Analysis failed.' });
  }
}