import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Briefcase, 
  Sparkles, 
  Loader2, 
  BrainCircuit, 
  Target, 
  MessageCircle, 
  Mail,
  ArrowRight,
  Shield, // 👈 Admin Icon
  Gift,   // 👈 Admin Icon
  Zap
} from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc, increment, getDocs } from 'firebase/firestore'; 
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
  
  // --- ADMIN STATE ---
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // 🔒 REPLACE WITH YOUR EXACT EMAIL
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "YOUR_EMAIL@GMAIL.COM"; 

  // --- RESEARCH STATE ---
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [demoCredits, setDemoCredits] = useState(() => {
    const saved = localStorage.getItem('sentient_demo_credits');
    return saved !== null ? parseInt(saved) : 2; 
  });

  // 1. 🛡️ ADMIN: Fetch Users (Only runs if you are admin)
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        setAdminUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchUsers();
    }
  }, [isAdmin]);

  // 2. 🛡️ ADMIN: Gift Credits Function
  const giftCredits = async (userId: string) => {
    if(!window.confirm("Gift 100 Credits?")) return;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { credits: increment(100), plan: 'pro' });
    alert("Grant Successful!");
    window.location.reload();
  };

  // 3. RESEARCH LOGIC
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      if (demoCredits <= 0) {
        alert("🚀 Demo Limit Reached! Sign up for a free account.");
        return;
      }
    } else {
      if (!user) return;
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData && userData.credits <= 0) {
        const wantToUpgrade = window.confirm("⚠️ Out of credits! Upgrade to Pro ($49)?");
        if (wantToUpgrade) window.location.href = 'https://buy.stripe.com/6oU7sK0yR5wB2N08KUdAk00';
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

      const prompt = `You are a B2B Sales Expert. Use Google Search to find real-time info about ${name}, ${role} at ${company}. 
      Return a valid JSON object with:
      1. personality (string): A psychological profile.
      2. painPoints (array of strings): 3 distinct business challenges.
      3. iceBreakers (array of strings): 3 specific conversation starters.
      4. emailDraft (string): A personalized cold email.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiData = JSON.parse(text);
      setDossier(aiData);

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
        name, company, role, stage: 'New', dossier, value: 0, createdAt: new Date()
      });
      setSaved(true);
    } catch (error) { alert("Failed to save."); } 
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 🛡️ GOD MODE PANEL (Only Visible to YOU) */}
      {isAdmin && (
        <div className="bg-slate-900 rounded-2xl p-6 border-2 border-red-900 shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowAdminPanel(!showAdminPanel)}>
            <div className="flex items-center gap-3">
              <Shield className="text-red-500" size={24} />
              <div>
                <h2 className="text-white font-black text-lg">COMMAND CENTER</h2>
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Administrator Access Granted</p>
              </div>
            </div>
            <button className="text-slate-400 text-sm hover:text-white">
              {showAdminPanel ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showAdminPanel && (
            <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Credits</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {adminUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-700/50">
                      <td className="p-3">
                        <div className="font-bold text-white">{u.email}</div>
                        <div className="text-[10px] opacity-50">{u.id}</div>
                      </td>
                      <td className="p-3 font-mono text-yellow-400">{u.credits}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => giftCredits(u.id)}
                          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto border border-emerald-500/20"
                        >
                          <Gift size={12} /> Gift 100
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STANDARD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
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
        {/* INPUT FORM */}
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

        {/* RESULTS AREA */}
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
                  <button onClick={handleSaveLead} disabled={saving || saved} className="bg-white border px-6 py-2 rounded-xl font-bold transition-all hover:bg-slate-50">
                    {saved ? 'Saved Successfully' : 'Save to Pipeline'}
                  </button>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-500 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-brand-600">
                  <BrainCircuit size={20} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Psychological Profile</h4>
                </div>
                <p className="text-slate-700 leading-relaxed">{dossier.personality}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-2 mb-4 text-red-600">
                    <Target size={20} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Pain Points</h4>
                  </div>
                  <ul className="space-y-3">
                    {dossier.painPoints?.map((point: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                        <span className="text-red-400 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <MessageCircle size={20} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Ice Breakers</h4>
                  </div>
                  <ul className="space-y-3">
                    {dossier.iceBreakers?.map((ice: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                        <span className="text-blue-400 mt-1">•</span>
                        {ice}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-2xl shadow-xl">
                 <div className="flex items-center gap-2 mb-6 text-slate-400 border-b border-slate-800 pb-4">
                    <Mail size={20} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Draft Email</h4>
                  </div>
                 <div className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {dossier.emailDraft}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                   <button 
                     onClick={() => navigator.clipboard.writeText(dossier.emailDraft)}
                     className="text-xs text-brand-400 hover:text-brand-300 font-bold uppercase tracking-widest flex items-center gap-2"
                   >
                     Copy to Clipboard <ArrowRight size={14} />
                   </button>
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