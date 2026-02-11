import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

// 🛡️ THE JSON SURGEON (Regex Edition)
// This finds the JSON object { ... } inside any amount of text
const cleanAndParseJSON = (text: string) => {
    try {
        // 1. Use Regex to find the first { and the last }
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) throw new Error("No JSON object found in response");
        
        let jsonString = jsonMatch[0];

        // 2. Parse it
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("JSON Parsing Failed. Raw Text:", text);
        // Fallback: If it fails, return a safe "Error" dossier so the app doesn't crash
        return {
            personality: "Analysis failed due to data formatting. Please try again.",
            painPoints: ["Could not extract data."],
            iceBreakers: ["Could not extract data."],
            emailDraft: "Error generating draft."
        };
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 🔒 SECURITY CHECK
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Missing Token');
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    // CHECK USER & LIMITS
    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
        await userRef.set({
            email: email || "unknown",
            usageCount: 0,
            plan: 'free',
            createdAt: new Date(),
            lastUsageDate: new Date().toISOString().split('T')[0]
        });
        userDoc = await userRef.get();
    }

    // Get current data
    let userData = userDoc.data() || {};
    let currentUsage = userData.usageCount || 0;
    
    // Daily Reset Logic
    const today = new Date().toISOString().split('T')[0]; 
    if (userData.lastUsageDate !== today) {
        await userRef.update({ usageCount: 0, lastUsageDate: today });
        currentUsage = 0; 
    }

    // Admin Bypass
    const isAdmin = email === 'lifeinnovations7@gmail.com'; 
    const isPro = userData.plan === 'pro' || userData.plan === 'premium' || isAdmin;
    const limit = isPro ? 100 : 3;

    if (currentUsage >= limit) {
        return res.status(403).json({ 
            error: isPro ? "Daily limit of 100 reached." : "Daily free limit reached. Upgrade to Pro.",
            limitReached: true
        });
    }

    // 🚀 RUN AI
    const { prospectName, company, role } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        // @ts-ignore
        tools: [{ googleSearch: {} }] 
    });

    // 🛡️ SAFETY PROMPT (Prevents Lies)
    const prompt = `
      You are a Lead Sales Researcher for AheadWithAI. 
      Target: ${prospectName}
      Role: ${role}
      Company: ${company}

      STEP 1: SEARCH AUDIT (Internal Only)
      - Use Google Search to find this person's LinkedIn, Twitter/X, or personal website.
      - Find EXACT quotes, specific company names, or recent project launches.
      - If you find multiple people with this name, look for the one associated with "${company}" or "${role}".
      - If NO verifiable match is found, DO NOT make up a story. Skip to STEP 2.

      STEP 2: THE "ZERO HALLUCINATION" RESPONSE
      - "personality": Describe their professional focus. If the data is sparse, stick to the known facts of their company's industry.
      - "painPoints": Identify 5 real challenges. If you are guessing based on the role, start the sentence with "Typically, someone in a role like this faces..."
      - "iceBreakers": Reference a specific, REAL event (e.g., "I saw your company recently raised X" or "I read your post about Y"). 
      - "emailDraft": A 1-to-1 email from AheadWithAI. NO BRACKETS. 

      ⚠️ ABSOLUTE RULES:
      1. If you cannot find evidence of the person, do not invent companies (like "Servengines"). 
      2. If search fails, base the analysis purely on the industry standards for a ${role} at a ${company}.
      3. Use your AheadWithAI identity: "We build AI Sales Agents that automate the research you're reading right now."
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // 🛡️ RUN THE SURGEON
    const jsonData = cleanAndParseJSON(text);
    
    // Update Backend Count (Frontend also updates, but this is the source of truth)
    await userRef.update({ usageCount: currentUsage + 1 });

    return res.status(200).json(jsonData);

  } catch (error: any) {
    console.error('Backend Error:', error);
    return res.status(500).json({ error: error.message || "AI Analysis Failed." });
  }
}