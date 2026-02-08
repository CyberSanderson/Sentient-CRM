import React, { useState } from 'react';
import { Search, Sparkles, User, Building2, Briefcase, Send, Loader2, BrainCircuit, Save, CheckCircle, Zap } from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore'; 
import { db } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useUser } from '@clerk/clerk-react'; 
import { GoogleGenerativeAI } from "@google/generative-ai"; 

interface DashboardViewProps {
  leads: Lead[];
  isDemoMode?: boolean; // 👈 Received from App.tsx
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, isDemoMode }) => {
  const { user } = useUser(); 
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛡️ 1. THE GATEKEEPER BYPASS
    // If it's a demo, we skip the credit check. If not, we enforce it.
    let canProceed = false;

    if (isDemoMode) {
      canProceed = true;
    } else if (user) {
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData && userData.credits <= 0) {
        alert("⚠️ Out of Credits: Upgrade to Pro to keep researching!");
        return;
      }
      canProceed = true;
    }

    if (!canProceed) return;

    setLoading(true);
    setDossier(null);
    setSaved(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // 🚀 Your stable Gemini 2.5 Flash Search Logic
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        tools: [{ googleSearch: {} } as any] 
      });

      const prompt = `You are a B2B Sales Expert. Use Google Search to find real-time info about ${name}, ${role} at ${company}. Return a valid JSON object with personality, painPoints (array), iceBreakers (array), and emailDraft.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiData = JSON.parse(text);
      setDossier(aiData);

      // 💰 2. DEDUCT CREDIT ONLY FOR LOGGED-IN USERS
      if (!isDemoMode && user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          credits: increment(-1)
        });
      }

    } catch (error: any) {
      console.error("AI Analysis failed", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async () => {
    if (!dossier || !user || isDemoMode) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'leads'), {
        userId: user.id, 
        name,
        company,
        role,
        stage: 'New', 
        dossier, 
        value: 0,
        createdAt: new Date()
      });
      setSaved(true);
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Research Center</h1>
        <p className="text-slate-500 mt-2">
          {isDemoMode ? "✨ Demo Mode: Explore the power of real-time search." : "Generate a psychological dossier using Real-Time Search."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search size={20} className="text-brand-500" />
              Target Profile
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-3">
                <input 
                  type="text" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Prospect Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input 
                  type="text" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Role (Optional)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isDemoMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-brand-600 hover:bg-brand-500'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'Searching...' : isDemoMode ? 'Analyze (Demo)' : 'Generate Dossier'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!dossier && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 min-h-[400px]">
              <BrainCircuit size={64} className="mb-4 opacity-20" />
              <p>Enter prospect details to unlock Real-Time insights</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 rounded-2xl border border-slate-200 min-h-[400px] animate-pulse">
              <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
              <p className="font-medium text-lg">Scanning the live internet...</p>
            </div>
          )}

          {dossier && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-end">
                {isDemoMode ? (
                  <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl border border-brand-100 text-sm font-bold">
                    ✨ Create an account to save this lead
                  </div>
                ) : (
                  <button 
                    onClick={handleSaveLead}
                    disabled={saving || saved}
                    className="bg-white text-slate-900 border border-slate-200 px-6 py-2 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                    {saved ? <CheckCircle size={20} className="text-emerald-500" /> : <Save size={20} />}
                    {saved ? 'Saved to Pipeline' : 'Save Lead'}
                  </button>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-500 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Personality</h3>
                <p className="text-slate-700 leading-relaxed font-medium">{dossier.personality}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-red-600 mb-3">Pain Points</h3>
                  <ul className="space-y-2">
                    {dossier.painPoints.map((p, i) => <li key={i} className="text-sm text-slate-600">• {p}</li>)}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-emerald-600 mb-3">Ice Breakers</h3>
                  <ul className="space-y-2">
                    {dossier.iceBreakers.map((p, i) => <li key={i} className="text-sm text-slate-600">• {p}</li>)}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Send className="text-brand-400" size={18} /> Email Draft
                </h3>
                <div className="text-slate-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">
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