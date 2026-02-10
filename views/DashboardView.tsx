import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Briefcase, Sparkles, Loader2, BrainCircuit, 
  Target, MessageCircle, Mail, ArrowRight, Shield, Gift, Zap
} from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc, increment, getDocs } from 'firebase/firestore'; 
import { db, auth } from '../lib/firebase'; // 👈 Make sure 'auth' is exported from your firebase config
import { Lead, Dossier } from '../types'; 
// import { useUser } from '@clerk/clerk-react'; // ⚠️ NOTE: If you use Clerk, token handling is different. Assuming Firebase Auth here.
import { onAuthStateChanged } from 'firebase/auth';

interface DashboardViewProps {
  leads: Lead[];
  isDemoMode: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, isDemoMode }) => {
  // --- AUTH STATE (Firebase) ---
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Normalize user object
        setUser({ ...currentUser, id: currentUser.uid });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- ADMIN STATE ---
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // 🔒 TODO: CHANGE THIS TO YOUR REAL EMAIL
  const isAdmin = user?.email === "sanderson@example.com"; 

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

  // 1. 🛡️ ADMIN: Fetch Users
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        setAdminUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchUsers();
    }
  }, [isAdmin]);

  // 2. 🛡️ ADMIN: Gift Credits
  const giftCredits = async (userId: string) => {
    if(!window.confirm("Gift 100 Credits?")) return;
    const userRef = doc(db, 'users', userId);
    // Note: We still do this client-side for Admin convenience, but usually this should be an API too
    await updateDoc(userRef, { usageCount: 0, plan: 'pro' }); // Reset usage and give pro
    alert("Grant Successful!");
    window.location.reload();
  };

  // 3. 🚀 RESEARCH LOGIC (The Big Fix)
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDossier(null);
    setSaved(false);

    // A. Demo Mode (Local Storage)
    if (isDemoMode) {
      if (demoCredits <= 0) {
        alert("🚀 Demo Limit Reached! Sign up for a free account.");
        setLoading(false);
        return;
      }
      // Demo still uses Client-Side or a specific demo API. 
      // For simplicity, let's assume demo users just get a fake response or need to sign up.
      alert("Please sign in to run live AI analysis.");
      setLoading(false);
      return;
    }

    // B. Real User (Secure Backend Call)
    try {
      if (!user) {
        alert("Please log in.");
        return;
      }

      // 1. Get the Secure Token
      const token = await auth.currentUser?.getIdToken();

      // 2. Call the Server (NO API KEYS HERE!)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 👈 Sending the ID card
        },
        body: JSON.stringify({ 
            prospectName: name, 
            company: company, 
            role: role 
        })
      });

      const data = await response.json();

      // 3. Handle Errors (Like Limits)
      if (!response.ok) {
        if (response.status === 403) {
            // Limit Reached!
            const wantToUpgrade = window.confirm(data.error || "Daily limit reached. Upgrade?");
            if (wantToUpgrade) window.location.href = 'https://buy.stripe.com/6oU7sK0yR5wB2N08KUdAk00'; // YOUR LIVE LINK
        } else {
            alert(data.error || "Analysis failed");
        }
        return;
      }

      // 4. Success
      setDossier(data);

    } catch (error: any) {
      console.error("Analysis failed", error);
      alert("System Error. Please try again.");
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
      
      {/* 🛡️ GOD MODE PANEL */}
      {isAdmin && (
        <div className="bg-slate-900 rounded-2xl p-6 border-2 border-red-900 shadow-2xl mb-8">
           {/* ... (Keep your existing Admin UI code here) ... */}
           {/* Just copied the structure for brevity, keep your table code! */}
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
               {/* Paste your existing Table code here */}
               <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-500 uppercase font-bold text-xs">
                  <tr><th className="p-3">User</th><th className="p-3">Credits</th><th className="p-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {adminUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-700/50">
                      <td className="p-3"><div className="font-bold text-white">{u.email}</div></td>
                      <td className="p-3 font-mono text-yellow-400">{u.usageCount || 0} used</td>
                      <td className="p-3 text-right">
                        <button onClick={() => giftCredits(u.id)} className="text-emerald-400 hover:text-white text-xs font-bold border border-emerald-500/20 px-2 py-1 rounded">Gift Pro</button>
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
          <p className="text-slate-500 text-sm">Real-time intelligence via Sentient AI Engine.</p>
        </div>
        {/* ... Keep Demo Credits UI ... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* ... Keep Inputs ... */}
              <div className="space-y-3">
                 <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required /></div>
                 <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required /></div>
                 <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Job Title" value={role} onChange={e => setRole(e.target.value)} /></div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isDemoMode ? 'bg-indigo-600' : 'bg-brand-600 hover:bg-brand-500'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Analyzing...' : 'Analyze Prospect'}
              </button>
            </form>
          </div>
        </div>

        {/* RESULTS AREA */}
        <div className="lg:col-span-2">
            {/* ... Keep your existing Results UI logic exactly as is ... */}
            {!dossier && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 min-h-[400px]">
                <BrainCircuit size={48} className="mb-4 opacity-10" />
                <p className="font-medium">Enter details to generate Sentient AI dossier</p>
            </div>
            )}

            {loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200 min-h-[400px]">
                <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
                <p className="font-bold text-lg">Sentient AI is analyzing...</p>
            </div>
            )}

            {dossier && (
                // ... Keep your existing Dossier display code ...
                <div className="space-y-6 animate-fade-in-up">
                    <div className="flex justify-end">
                        <button onClick={handleSaveLead} disabled={saving || saved} className="bg-white border px-6 py-2 rounded-xl font-bold transition-all hover:bg-slate-50">
                         {saved ? 'Saved Successfully' : 'Save to Pipeline'}
                        </button>
                    </div>
                    {/* ... The rest of your dossier UI ... */}
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-500 shadow-sm">
                        <p className="text-slate-700 leading-relaxed">{dossier.personality}</p>
                    </div>
                    {/* ... Pain Points, Ice Breakers, Email ... */}
                    {/* (I am hiding these to save space, but DO NOT delete them from your file!) */}
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-xl">
                        <div className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{dossier.emailDraft}</div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;