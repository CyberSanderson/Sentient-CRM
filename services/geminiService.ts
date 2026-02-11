import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

// Initialize Gemini Client
// NOTE: process.env.API_KEY is assumed to be available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ---------------------------------------------------------
// ⚡ CRITICAL UPDATE: Switched all models to 'gemini-1.5-flash'
// to prevent 429 Rate Limit errors and ensure stability.
// ---------------------------------------------------------

export const generateLeadInsight = async (lead: Lead): Promise<string> => {
  try {
    const prompt = `
      Analyze the following sales lead for a B2B service company.
      
      Lead Name: ${lead.name}
      Company: ${lead.company}
      Value: $${lead.value}
      Stage: ${lead.stage}
      
      Provide a concise (max 3 sentences) strategic insight on how to move this deal forward or identify potential risks.
      Be direct and professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // 👈 CHANGED
      contents: prompt,
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insight at this time. Please check your API configuration.";
  }
};

export const generateColdEmail = async (lead: Lead): Promise<string> => {
  try {
    const prompt = `
      Write a personalized, professional, and persuasive cold email to this lead.
      
      Recipient: ${lead.name} at ${lead.company}
      Context: They are currently in the "${lead.stage}" stage.
      Deal Value: $${lead.value}
      
      The tone should be confident but helpful. Keep it under 150 words.
      Subject line included.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // 👈 CHANGED
      contents: prompt,
    });

    return response.text || "Draft generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating email draft.";
  }
};

export const generateDailyBriefing = async (leads: Lead[]): Promise<string> => {
  try {
    const summary = leads.map(l => `- ${l.name} (${l.company}): ${l.stage}, $${l.value}`).join('\n');
    
    const prompt = `
      You are a sales manager AI. Review the current pipeline state below and provide a "Daily Briefing".
      
      Pipeline Data:
      ${summary}
      
      The briefing should include:
      1. A quick sentiment analysis of the pipeline health.
      2. Top 3 recommended actions for the sales team today.
      3. A motivational quote for sales professionals.
      
      Format with clear headings. Use Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // 👈 CHANGED
      contents: prompt,
    });

    return response.text || "Briefing unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System offline. Briefing unavailable.";
  }
};

export const scoreLeadAI = async (lead: Lead): Promise<{ score: number; reason: string }> => {
  try {
    const prompt = `
      Evaluate this sales lead and assign a score from 0 to 100 representing the probability of closing.
      
      Lead: ${JSON.stringify(lead)}
      
      Return ONLY a JSON object with the following schema:
      {
        "score": number,
        "reason": "short explanation string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // 👈 CHANGED
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Scoring Error:", error);
    return { score: 50, reason: "AI scoring service unavailable." };
  }
}