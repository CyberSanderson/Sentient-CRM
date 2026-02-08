import React, { useState, useEffect } from 'react';
import { Search, Sparkles, User, Building2, Briefcase, Send, Loader2, BrainCircuit, Save, CheckCircle, Zap, ShieldAlert } from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore'; 
import { db } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useUser } from '@clerk/clerk-react'; 
import { GoogleGenerativeAI } from "@google/generative-ai"; 

interface DashboardViewProps {
  leads: Lead[];
  isDemoMode: boolean;
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

  // 🛡️ TRACK DEMO USAGE IN BROWSER
  const [demoCredits, setDemoCredits] = useState(() => {
    const saved = localStorage.getItem('sentient_demo_credits');
    return saved !== null ? parseInt(saved) : 2; // Start with 2 demo searches
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛑 1. THE GATEKEEPER
    if (isDemoMode) {
      if (demoCredits <= 0) {
        alert("🚀 Demo Limit Reached! You've used your free demo searches. Sign up for a free account to get 3 more credits and save your leads!");
        return;
      }
    } else {
      if (!user) return;
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (userData && userData.credits <= 0) {
        alert("⚠️ Out of Credits: Upgrade to Pro to keep researching!");
        return;
      }
    }

    setLoading(true);
    setDossier(null);
    setSaved(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      
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

      // 💰 2. DEDUCT CREDITS
      if (isDemoMode) {
        const newCredits = demoCredits - 1;
        setDemoCredits(newCredits);
        localStorage.setItem('sentient_demo_credits', newCredits.toString());
      } else if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { credits: increment(-1) });
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
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Research Center</h1>
          <p className="text-slate-500 text-sm">Real-time intelligence via Gemini Search.</p>
        </div>
        {isDemoMode && (
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-100 rounded-xl">
            <Zap size={16} className="text-brand-600 fill-brand-600" />
            <span className="text-xs font-bold text-brand-700 uppercase tracking-tight">
              {demoCredits} Demo Searches Left
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="relative">
                   <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required />
                </div>
                <div className="relative">
                   <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" placeholder="Job Title" value={role} onChange={e => setRole(e.target.value)} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || (isDemoMode && demoCredits <= 0)}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isDemoMode ? 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300' : 'bg-brand-600 hover:bg-brand-500'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Searching...' : isDemoMode && demoCredits <= 0 ? 'Limit Reached' : 'Analyze Prospect'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!dossier && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 min-h-[400px]">
              <BrainCircuit size={48} className="mb-4 opacity-10" />
              <p className="font-medium">Enter details to generate AI dossier</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200 min-h-[400px]">
              <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
              <p className="font-bold text-lg">Scanning the live web...</p>
            </div>
          )}

          {dossier && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-end">
                {isDemoMode ? (
                  <button onClick={() => window.location.reload()} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">
                    Sign Up to Save Lead
                  </button>
                ) : (
                  <button onClick={handleSaveLead} disabled={saving || saved} className="bg-white border px-6 py-2 rounded-xl font-bold">
                    {saved ? 'Saved' : 'Save Lead'}
                  </button>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-500 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Personality Profile</h4>
                <p className="text-slate-700 leading-relaxed">{dossier.personality}</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {dossier.emailDraft}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;