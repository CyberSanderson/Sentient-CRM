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
      You are the lead Sales Strategist for "AheadWithAI", a company that builds custom AI Marketing Systems and Lead Generation Agents.
      Target: ${prospectName}
      Role: ${role}
      Company: ${company}

      TASK:
      1. Use Google Search to find a REAL hook (podcast, recent investment, or specific business philosophy).
      2. Write a 1-to-1 personalized email from "AheadWithAI" to the target.

      ⚠️ STRICT RULES FOR THE EMAIL:
      - ZERO PLACEHOLDERS. No [Your Company], no [Insert Mission]. 
      - Talk as AheadWithAI. Our mission is to "Automate the grunt work of sales using custom AI agents so founders can focus on closing."
      - DO NOT ask the user to "describe their mission." YOU describe how AheadWithAI helps ${company} specifically.
      - Be direct. Instead of "potential synergies," say "I saw your investment in X and it's clear you value Y; here is how our AI agents scale that."
      - If you use a bracket [], the response is a failure.

      OUTPUT REQUIREMENTS (Strict JSON):
      1. "personality": Professional profile based on search.
      2. "painPoints": 5 specific challenges for a ${role}.
      3. "iceBreakers": 3 specific hooks found via Google.
      4. "emailDraft": A ready-to-send, high-conversion email.

      RETURN ONLY JSON. Start with { and end with }.
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