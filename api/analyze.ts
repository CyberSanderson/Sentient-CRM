import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prospectName, company, role } = req.body;

  if (!prospectName || !company) {
    return res.status(400).json({ error: 'Name and Company are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 2. The "Golden Prompt" - This is your product's secret sauce
    const prompt = `
      Act as a world-class sales strategist and behavioral psychologist. 
      Analyze a prospect named "${prospectName}" who is the "${role}" at "${company}".
      
      Based on general knowledge about this role and industry, generate a Sales Dossier in strictly valid JSON format.
      
      The JSON must have this exact structure:
      {
        "personality": "A short analysis of what likely drives this person (e.g., ROI, Innovation, Safety)",
        "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
        "iceBreakers": ["Conversation starter 1", "Conversation starter 2"],
        "emailDraft": "A short, punchy cold email draft under 100 words."
      }
      
      Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 3. Clean up the text to ensure it is pure JSON
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return res.status(200).json(JSON.parse(cleanedText));

  } catch (error: any) {
    console.error('AI Error:', error);
    return res.status(500).json({ error: 'Failed to generate dossier', details: error.message });
  }
}