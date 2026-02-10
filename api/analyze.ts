import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// 1. Initialize Firebase Admin (The "Security Guard")
// We wrap this in a check so it doesn't crash if already initialized
if (!admin.apps.length) {
  try {
    // This loads the "Master Key" you added to Vercel Env Variables
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
  // A. CORS & Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // B. SECURITY: Verify the User's ID Card
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Token' });
  }
  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the token with Firebase Auth to get the REAL User ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // C. GET USER DATA & CHECK LIMITS
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).json({ error: 'User profile not found.' });
    }

    const userData = userDoc.data() || {};
    
    // --- DAILY RESET LOGIC (The "Watch") ---
    const today = new Date().toISOString().split('T')[0]; // e.g. "2026-02-10"
    
    // If the last time they used it wasn't today, reset their count!
    if (userData.lastUsageDate !== today) {
        await userRef.update({
            usageCount: 0,
            lastUsageDate: today
        });
        userData.usageCount = 0; // Update local variable so they pass the check below
    }

    // --- ENFORCE PLAN LIMITS ---
    // Pro gets 100, Free gets 3
    const isPro = userData.plan === 'pro' || userData.plan === 'premium';
    const limit = isPro ? 100 : 3;

    if ((userData.usageCount || 0) >= limit) {
        return res.status(403).json({ 
            error: isPro 
                ? "You hit the 100 daily limit!" 
                : "Daily free limit reached (3/3). Upgrade to Pro for 100/day.",
            limitReached: true
        });
    }

    // D. VALIDATE INPUTS
    const { prospectName, company, role } = req.body;
    if (!prospectName || !company) {
      return res.status(400).json({ error: 'Name and Company are required' });
    }

    // E. RUN SENTIENT AI (Your Gemini Code)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server Error: AI Key missing' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Act as a world-class sales strategist. Analyze this prospect:
      Name: "${prospectName}"
      Role: "${role}"
      Company: "${company}"
      
      Generate a Sales Dossier in strict JSON format (no markdown code blocks):
      {
        "personality": "Psychological driver analysis (e.g. Skeptic, Visionary)",
        "painPoints": ["Specific pain point 1", "Specific pain point 2", "Specific pain point 3"],
        "iceBreakers": ["Research-based opener 1", "Research-based opener 2"],
        "emailDraft": "A cold email draft under 100 words using the insights above."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    // F. SUCCESS: Increment Usage Count
    // Only happens if AI succeeds
    await userRef.update({
        usageCount: admin.firestore.FieldValue.increment(1)
    });

    return res.status(200).json(JSON.parse(text));

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to generate analysis.' });
  }
}