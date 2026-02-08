import React, { useState } from 'react';
import { Search, Sparkles, User, Building2, Briefcase, Send, Loader2, BrainCircuit, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useUser } from '@clerk/clerk-react'; 
import { GoogleGenerativeAI } from "@google/generative-ai"; 

interface DashboardViewProps {
  leads: Lead[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads }) => {
  const { user } = useUser(); 
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // --- 🧠 THE REAL AI BRAIN (Gemini 2.5) ---
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDossier(null);
    setSaved(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY in .env file");
      }

      // 1. Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // 🚀 UPDATED: Using Gemini 2.5 Flash (The 2026 Standard)
      // If this fails, it falls back to 2.0 automatically in the catch block? 
      // No, we set it explicitly here.
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 2. The Prompt (Strict JSON Instructions)
      const prompt = `
        You are a B2B Sales Expert. Analyze this prospect:
        Name: ${name}
        Role: ${role}
        Company: ${company}

        Return a VALID JSON object (no markdown formatting, no backticks) with these 4 fields:
        1. "personality": A 2-sentence psychological profile of this person based on their role/industry.
        2. "painPoints": An array of 3 specific business problems they likely face.
        3. "iceBreakers": An array of 2 casual, professional observations to start a conversation.
        4. "emailDraft": A short, 3-paragraph cold email pitching a "AI Sales Assistant".
      `;

      // 3. Generate
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // 4. Clean & Parse JSON (Sanitization)
      // Sometimes models add ```json ... ``` wrappers
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiData = JSON.parse(text);
      setDossier(aiData);

    } catch (error: any) {
      console.error("AI Analysis failed", error);
      
      // ⚠️ Fallback Message if 2.5 isn't available on your specific key yet
      if (error.message.includes("404") || error.message.includes("not found")) {
        alert("Error: Gemini 2.5 Flash model not found. Please check your API key permissions or try 'gemini-2.0-flash'.");
      } else {
        alert(`AI Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async () => {
    if (!dossier || !user) return;
    setSaving(true);

    try {
      await addDoc(collection(db, 'leads'), {
        userId: user.id, 
        name,
        contactName: name, // Compatibility
        company,
        role,
        status: 'New',
        stage: 'New', 
        value: 0, 
        dossier: dossier, 
        aiScore: Math.floor(Math.random() * (95 - 60 + 1)) + 60, 
        createdAt: new Date() // Correct Timestamp
      });
      
      setSaved(true);
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Research Center</h1>
          <p className="text-slate-500 mt-2">Generate a psychological dossier using Gemini 2.5.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search size={20} className="text-brand-500" />
              Target Profile
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prospect Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. Satya Nadella"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. Microsoft"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. CEO"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'Analyzing...' : 'Generate Dossier'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Results & Save Button */}
        <div className="lg:col-span-2">
          {!dossier && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 min-h-[400px]">
              <BrainCircuit size={64} className="mb-4 opacity-20" />
              <p>Enter prospect details to unlock Gemini 2.5 insights</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 rounded-2xl border border-slate-200 min-h-[400px] animate-pulse">
              <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
              <p className="font-medium text-lg">Consulting Gemini 2.5...</p>
              <p className="text-sm opacity-70">Analyzing role, industry trends, and psychology...</p>
            </div>
          )}

          {dossier && (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* === SAVE BUTTON SECTION === */}
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveLead}
                  disabled={saving || saved}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md transition-all ${
                    saved 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : (saved ? <CheckCircle size={20} /> : <Save size={20} />)}
                  {saved ? 'Saved to Leads' : 'Save Lead'}
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border-l-4 border-purple-500 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <BrainCircuit className="text-purple-500" size={24} />
                  Psychological Profile
                </h3>
                <p className="text-slate-600 leading-relaxed">{dossier.personality}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-red-600 mb-4">Likely Pain Points</h3>
                  <ul className="space-y-3">
                    {dossier.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-emerald-600 mb-4">Ice Breakers</h3>
                  <ul className="space-y-3">
                    {dossier.iceBreakers.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Send className="text-brand-400" size={20} />
                    Generated Draft
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(dossier.emailDraft)}
                    className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {dossier.emailDraft}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;