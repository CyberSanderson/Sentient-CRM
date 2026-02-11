import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Building2, Briefcase, Sparkles, Loader2, BrainCircuit, 
  Target, MessageCircle, Mail, ArrowRight, Shield, Gift, Zap, CreditCard
} from 'lucide-react';
import { collection, addDoc, doc, updateDoc, setDoc, getDocs, onSnapshot, getDoc } from 'firebase/firestore'; 
import { signInWithCredential, OAuthProvider } from 'firebase/auth'; 
import { db, auth } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useAuth, useUser } from '@clerk/clerk-react'; 

// 🛡️ HELPERS
const safeList = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return [data];
  return ["No data available"];
};

const renderSafe = (data: any) => {
  if (!data) return "No analysis available.";
  if (typeof data === 'string') return data;
  return String(data);
};

interface DashboardViewProps {
  leads: Lead[];
  isDemoMode: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, isDemoMode }) => {
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userStats, setUserStats] = useState({ plan: 'free', usageCount: 0, businessName: '' });
  
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "lifeinnovations7@gmail.com"; 

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

  // 1. SYNC STATS
  useEffect(() => {
    if (user && !isDemoMode) {
        const unsub = onSnapshot(doc(db, 'users', user.id), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setUserStats(docSnapshot.data() as any);
            }
        });
        return () => unsub(); 
    }
  }, [user, isDemoMode]);

  // 2. RESEARCH LOGIC
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authLoaded) return;

    setLoading(true);
    setDossier(null);
    setSaved(false);

    if (isDemoMode) {
      if (demoCredits <= 0) {
        alert("🚀 Demo Limit Reached!");
        setLoading(false);
        return;
      }
      setDemoCredits(prev => prev - 1);
      await new Promise(r => setTimeout(r, 2000));
      alert("Please sign in to run live AI analysis.");
      setLoading(false);
      return;
    }

    try {
      const clerkToken = await getToken({ template: 'firebase' });
      const provider = new OAuthProvider('oidc.clerk'); 
      const credential = provider.credential({ idToken: clerkToken! });
      const firebaseResult = await signInWithCredential(auth!, credential);
      const firebaseIdToken = await firebaseResult.user.getIdToken();

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firebaseIdToken}` 
        },
        body: JSON.stringify({ 
          prospectName: name, 
          company, 
          role,
          // 🚀 DYNAMIC IDENTITY
          senderName: user?.fullName || "A Sales Professional",
          senderBusiness: userStats.businessName || "their professional services business"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Analysis failed.");
        return;
      }

      setDossier(data);
      
      // ✅ THE FIX: setDoc with merge: true handles new users without crashing
      if (user) {
          const currentCount = userStats.usageCount || 0;
          await setDoc(doc(db, 'users', user.id), { 
              usageCount: currentCount + 1,
              lastUsageDate: new Date().toISOString().split('T')[0]
          }, { merge: true });
          
          setUserStats(prev => ({ ...prev, usageCount: currentCount + 1 }));
      }

    } catch (error: any) {
      console.error("Analysis Error:", error);
      alert(`System Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async () => {
    if (!dossier || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'leads'), {
        userId: user.id, name, company, role, stage: 'New', dossier, createdAt: new Date()
      });
      setSaved(true);
    } catch (error) { alert("Failed to save."); } 
    finally { setSaving(false); }
  };

  const limit = (userStats.plan === 'pro' || isAdmin) ? 100 : 3;
  const creditsLeft = Math.max(0, limit - (userStats.usageCount || 0));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Research Center</h1>
          <p className="text-slate-500 text-sm">Real-time intelligence via Sentient AI Engine.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="text-right px-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {userStats.plan === 'pro' || isAdmin ? 'Pro Plan' : 'Free Plan'}
                </div>
                <div className="text-sm font-black text-slate-700">
                    {creditsLeft} / {limit} Credits Left
                </div>
            </div>
            {!isAdmin && userStats.plan !== 'pro' && (
                <button onClick={() => window.location.href = 'https://buy.stripe.com/28E9ASepHf7bdrEbX6dAk01'} className="bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-bold">Upgrade</button>
            )}
        </div>
      </div>

      {/* 🚀 SETTINGS BOX (So users can define their business) */}
      <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-brand-600 p-2 rounded-lg text-white">
              <Building2 size={20} />
          </div>
          <div className="flex-1">
              <h3 className="text-xs font-bold text-brand-900 uppercase">My Business Name</h3>
              <input 
                className="w-full bg-transparent border-b border-brand-200 focus:border-brand-500 outline-none text-sm font-medium text-brand-800"
                placeholder="e.g. AheadWithAI"
                value={userStats.businessName}
                onChange={async (e) => {
                    const val = e.target.value;
                    setUserStats(prev => ({ ...prev, businessName: val }));
                    if(user) await setDoc(doc(db, 'users', user.id), { businessName: val }, { merge: true });
                }}
              />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required /></div>
                  <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required /></div>
                  <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Job Title" value={role} onChange={e => setRole(e.target.value)} /></div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Analyzing...' : 'Analyze Prospect'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
            {dossier ? (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-500 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-brand-600">
                          <BrainCircuit size={20} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Psychological Profile</h4>
                        </div>
                        <p className="text-slate-700">{renderSafe(dossier.personality)}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4">Pain Points</h4>
                             <ul className="space-y-3">
                                {safeList(dossier.painPoints).map((p, i) => <li key={i} className="text-sm text-slate-700">• {p}</li>)}
                             </ul>
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Ice Breakers</h4>
                             <ul className="space-y-3">
                                {safeList(dossier.iceBreakers).map((p, i) => <li key={i} className="text-sm text-slate-700">• {p}</li>)}
                             </ul>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-xl">
                        <div className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-widest">Draft Email</div>
                        <div className="text-slate-300 font-mono text-sm whitespace-pre-wrap">{renderSafe(dossier.emailDraft)}</div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 min-h-[400px]">
                    {loading ? <Loader2 size={48} className="animate-spin text-brand-500 mb-4" /> : <BrainCircuit size={48} className="mb-4 opacity-10" />}
                    <p className="font-medium">{loading ? 'Scanning the live web...' : 'Enter details to generate AI dossier'}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;