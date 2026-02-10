import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    const userData = userDoc.data() || {};
    
    // --- DAILY RESET LOGIC ---
    const today = new Date().toISOString().split('T')[0]; 
    if (userData.lastUsageDate !== today) {
        await userRef.update({ usageCount: 0, lastUsageDate: today });
        userData.usageCount = 0;
    }

    // --- LIMITS ---
    const isPro = userData.plan === 'pro' || userData.plan === 'premium';
    const limit = isPro ? 100 : 3;

    if ((userData.usageCount || 0) >= limit) {
        return res.status(403).json({ 
            error: isPro ? "Daily limit of 100 reached." : "Daily free limit reached (3/3). Upgrade to Pro for 100/day.",
            limitReached: true
        });
    }

    const { prospectName, company, role } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI Key missing' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Act as a sales strategist. Analyze ${prospectName}, ${role} at ${company}. Return strict JSON with personality, painPoints (array), iceBreakers (array), emailDraft.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    await userRef.update({ usageCount: admin.firestore.FieldValue.increment(1) });

    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ error: 'Processing failed.' });
  }
}