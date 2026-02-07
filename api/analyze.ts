import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS & Method Security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prospectName, company, role } = req.body;

  if (!prospectName || !company) {
    return res.status(400).json({ error: 'Name and Company are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: AI Key missing' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Note: ensure your API key has access to 2.0-flash, otherwise fallback to 'gemini-1.5-flash'
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
    const text = response.text();

    // Cleaning: Remove markdown code blocks if the model adds them
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return res.status(200).json(JSON.parse(cleanedText));

  } catch (error: any) {
    console.error('AI Processing Error:', error);
    // Return a generic error to client, log specific error on server
    return res.status(500).json({ error: 'Failed to generate analysis. Please try again.' });
  }
}