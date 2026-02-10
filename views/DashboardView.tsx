import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Briefcase, Sparkles, Loader2, BrainCircuit, 
  Target, MessageCircle, Mail, ArrowRight, Shield, Gift, Zap
} from 'lucide-react';
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore'; 
import { signInWithCredential, OAuthProvider } from 'firebase/auth'; // 👈 New Imports
import { db, auth } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useAuth, useUser } from '@clerk/clerk-react'; 

interface DashboardViewProps {
  leads: Lead[];
  isDemoMode: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, isDemoMode }) => {
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // 🔒 REPLACE WITH YOUR REAL EMAIL
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "YOUR_EMAIL@GMAIL.COM"; 

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

  // 1. ADMIN LOGIC
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        setAdminUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchUsers();
    }
  }, [isAdmin]);

  const giftCredits = async (userId: string) => {
    if(!window.confirm("Gift 100 Credits & Reset Usage?")) return;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { usageCount: 0, plan: 'pro' }); 
    alert("Grant Successful!");
    window.location.reload();
  };

  // 2. RESEARCH LOGIC (THE FIX IS HERE)
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authLoaded) return;

    setLoading(true);
    setDossier(null);
    setSaved(false);

    // A. Demo Mode
    if (isDemoMode) {
      if (demoCredits <= 0) {
        alert("🚀 Demo Limit Reached! Sign up for a free account.");
        setLoading(false);
        return;
      }
      alert("Please sign in to run live AI analysis.");
      setLoading(false);
      return;
    }

    // B. Live User (The Secure Handshake)
    try {
      // Step 1: Get the Clerk Token
      const clerkToken = await getToken({ template: 'firebase' });
      if (!clerkToken) throw new Error("Clerk token missing");

      // Step 2: Trade it for a Firebase Token (The Handshake)
      // Note: 'oidc.clerk' must match the Provider ID you set in Firebase Console!
      const provider = new OAuthProvider('oidc.clerk'); 
      const credential = provider.credential({ idToken: clerkToken });
      
      // Sign in to Firebase locally
      const firebaseResult = await signInWithCredential(auth, credential);
      
      // Step 3: Get the Google-signed Token
      const firebaseIdToken = await firebaseResult.user.getIdToken();

      // Step 4: Send the GOOGLE Token to Backend
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firebaseIdToken}` // 👈 Sending the correct token now
        },
        body: JSON.stringify({ prospectName: name, company, role })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
            const wantToUpgrade = window.confirm(data.error || "Daily limit reached.");
            if (wantToUpgrade) window.location.href = 'https://buy.stripe.com/6oU7sK0yR5wB2N08KUdAk00';
        } else {
            alert(data.error || "Analysis failed.");
        }
        return;
      }

      setDossier(data);

    } catch (error: any) {
      console.error("Handshake Error:", error);
      alert(`Connection Error: ${error.message || "Please refresh and try again."}`);
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
    } catch (error) { alert("Failed to save lead."); } 
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 🛡️ GOD MODE PANEL */}
      {isAdmin && (
        <div className="bg-slate-900 rounded-2xl p-6 border-2 border-red-900 shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowAdminPanel(!showAdminPanel)}>
            <div className="flex items-center gap-3">
              <Shield className="text-red-500" size={24} />
              <div>
                <h2 className="text-white font-black text-lg">COMMAND CENTER</h2>
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Administrator Access</p>
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
                  <tr><th className="p-3">User</th><th className="p-3">Credits</th><th className="p-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {adminUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-700/50">
                      <td className="p-3"><div className="font-bold text-white">{u.email}</div></td>
                      <td className="p-3 font-mono text-yellow-400">{u.usageCount || 0}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => giftCredits(u.id)} className="text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold">Gift Pro</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Research Center</h1>
          <p className="text-slate-500 text-sm">Real-time intelligence via Sentient AI Engine.</p>
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
                 <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required /></div>
                 <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required /></div>
                 <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Job Title" value={role} onChange={e => setRole(e.target.value)} /></div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Analyzing...' : 'Analyze Prospect'}
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
                        <button onClick={handleSaveLead} disabled={saving || saved} className="bg-white border px-6 py-2 rounded-xl font-bold hover:bg-slate-50">
                         {saved ? 'Saved' : 'Save Lead'}
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-500 shadow-sm">
                        <p className="text-slate-700">{dossier.personality}</p>
                    </div>
                    {/* Pain Points & Ice Breakers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                             <ul className="space-y-3">{dossier.painPoints?.map((p: string, i: number) => <li key={i} className="text-sm text-slate-700">• {p}</li>)}</ul>
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                             <ul className="space-y-3">{dossier.iceBreakers?.map((p: string, i: number) => <li key={i} className="text-sm text-slate-700">• {p}</li>)}</ul>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-xl">
                        <div className="text-slate-300 font-mono text-sm whitespace-pre-wrap">{dossier.emailDraft}</div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;