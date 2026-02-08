import React, { useState } from 'react';
import { Search, Sparkles, User, Building2, Briefcase, Send, Loader2, BrainCircuit, Save, CheckCircle, Lock, Zap } from 'lucide-react';
// Added 'doc', 'getDoc', 'updateDoc', and 'increment' for the credit system
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore'; 
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

  // --- 🧠 THE MONETIZED AI BRAIN ---
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 🛑 1. CREDIT GATEKEEPER
    // We check the database to see if the user has enough credits to proceed
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData && userData.credits <= 0) {
      alert("⚠️ You have 0 credits remaining. Please upgrade to the Pro Plan to continue researching prospects!");
      return;
    }

    setLoading(true);
    setDossier(null);
    setSaved(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing Gemini API Key");

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // 🚀 RESTORED: Your exact Gemini 2.5 Flash Search Logic
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        tools: [{
          googleSearch: {} 
        } as any] 
      });

      const prompt = `
        You are a B2B Sales Expert. 
        First, USE GOOGLE SEARCH to find real-time information about this prospect:
        Name: ${name}
        Role: ${role}
        Company: ${company}

        Based specifically on the search results (recent news, LinkedIn, company website), return a VALID JSON object (no markdown formatting, no backticks) with these 4 fields:
        1. "personality": A 2-sentence psychological profile inferred from their actual public activity/interviews.
        2. "painPoints": An array of 3 specific business problems their company is currently facing (cite real news/events if possible).
        3. "iceBreakers": An array of 2 observations about their recent posts, news, or company milestones.
        4. "emailDraft": A short, 3-paragraph cold email pitching a "AI Sales Assistant". Mention a specific fact you found.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // 🧼 CLEAN & PARSE JSON
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(text);
      
      setDossier(aiData);

      // ✅ 2. DEDUCT CREDIT ON SUCCESS
      // We only take a credit if the AI successfully returned data
      await updateDoc(userRef, {
        credits: increment(-1)
      });

    } catch (error: any) {
      console.error("AI Analysis failed", error);
      alert(`AI Error: ${error.message}. No credits were deducted.`);
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
        company,
        role,
        stage: 'New', 
        dossier: dossier, 
        value: 0,
        aiScore: Math.floor(Math.random() * (95 - 60 + 1)) + 60, 
        createdAt: new Date()
      });
      setSaved(true);
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Failed to save lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Research Center</h1>
          <p className="text-slate-500 mt-2">Generate hyper-personalized dossiers using Gemini Real-Time Search.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Search size={20} className="text-brand-500" />
              Prospect Details
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" required
                      className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                      placeholder="e.g. Jensen Huang"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" required
                      className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                      placeholder="e.g. Nvidia"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text"
                      className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                      placeholder="e.g. CEO"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-slate-900 hover:bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} className="group-hover:fill-current" />}
                {loading ? 'Performing Live Search...' : 'Analyze Prospect'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Container */}
        <div className="lg:col-span-2">
          {!dossier && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[500px]">
              <div className="p-6 bg-slate-100 rounded-full mb-6">
                <BrainCircuit size={48} className="opacity-20" />
              </div>
              <p className="font-bold text-slate-500">Ready to start your research</p>
              <p className="text-sm opacity-60">Search results will appear here in real-time</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white rounded-3xl border border-slate-200 min-h-[500px] shadow-sm">
              <div className="relative mb-8">
                 <Loader2 size={64} className="animate-spin text-brand-500" />
                 <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" size={24} />
              </div>
              <p className="font-black text-xl text-slate-900">Scanning the Live Web</p>
              <p className="text-slate-400 mt-2 text-center max-w-sm">Checking recent news, LinkedIn profiles, and interviews for ${name}...</p>
            </div>
          )}

          {dossier && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle size={20} />
                  <span>Dossier Ready</span>
                </div>
                <button 
                  onClick={handleSaveLead}
                  disabled={saving || saved}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                    saved 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20'
                  }`}
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : (saved ? <CheckCircle size={18} /> : <Save size={18} />)}
                  {saved ? 'Saved Successfully' : 'Save to Pipeline'}
                </button>
              </div>

              {/* Personality Section */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500" />
                <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BrainCircuit size={18} />
                  Psychological Profile
                </h3>
                <p className="text-xl text-slate-800 leading-relaxed font-medium">
                  "{dossier.personality}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-6">Critical Pain Points</h3>
                  <div className="space-y-4">
                    {dossier.painPoints.map((point, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-red-50 rounded-2xl border border-red-100">
                        <span className="w-8 h-8 rounded-xl bg-white text-red-500 flex items-center justify-center shrink-0 font-black shadow-sm">{i+1}</span>
                        <p className="text-sm text-red-900 font-medium leading-snug">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-6">Verified Ice Breakers</h3>
                  <div className="space-y-4">
                    {dossier.iceBreakers.map((point, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="w-8 h-8 rounded-xl bg-white text-emerald-500 flex items-center justify-center shrink-0 font-black shadow-sm">{i+1}</span>
                        <p className="text-sm text-emerald-900 font-medium leading-snug">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email Section */}
              <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative group">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-6">
                  <h3 className="text-white font-bold flex items-center gap-3">
                    <div className="p-2 bg-brand-600 rounded-lg">
                       <Send size={18} />
                    </div>
                    Hyper-Personalized Draft
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(dossier.emailDraft)}
                    className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-4 py-2 rounded-xl transition-all"
                  >
                    Copy Draft
                  </button>
                </div>
                <div className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-brand-500/30">
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