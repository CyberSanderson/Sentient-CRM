import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Building2, Briefcase, Sparkles, Loader2, BrainCircuit, 
  Target, MessageCircle, Mail, Shield, Zap, CreditCard, Lock, CheckCircle2, 
  Download, Printer
} from 'lucide-react';
import { collection, addDoc, doc, updateDoc, setDoc, getDocs, onSnapshot } from 'firebase/firestore'; 
import { signInWithCredential, OAuthProvider } from 'firebase/auth'; 
import { db, auth } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react'; 
import { useReactToPrint } from 'react-to-print';

// 🛡️ HELPER 1: Handle Lists Safely
const safeList = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return [data];
  if (typeof data === 'object') return Object.values(data).map(v => String(v));
  return ["No data available"];
};

// 🛡️ HELPER 2: Handle Text/Objects Safely
const renderSafe = (data: any) => {
  if (!data) return "No analysis available.";
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    return data.style || data.communication || data.summary || Object.values(data).join(". ");
  }
  return String(data);
};

interface DashboardViewProps {
  leads: Lead[];
  isDemoMode: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, isDemoMode }) => {
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();

  // 🖨️ PRINT REF
  const componentRef = useRef<HTMLDivElement>(null);

  // 🖨️ PRINT FUNCTION
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Sentient_Dossier_${new Date().toLocaleDateString()}`,
  });

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userStats, setUserStats] = useState({ plan: 'free', usageCount: 0, lastUsageDate: '', businessName: '' });
  
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "lifeinnovations7@gmail.com"; 

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoCredits, setDemoCredits] = useState(() => {
    const saved = localStorage.getItem('sentient_demo_credits');
    return saved !== null ? parseInt(saved) : 2; 
  });

  // 1. REAL-TIME LISTENER
  useEffect(() => {
    if (user && !isDemoMode) {
        const unsub = onSnapshot(doc(db, 'users', user.id), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setUserStats(docSnapshot.data() as any);
            } else {
                setUserStats({ plan: 'free', usageCount: 0, lastUsageDate: '', businessName: '' });
            }
        });
        return () => unsub(); 
    }
  }, [user, isDemoMode]);

  // 2. ADMIN LOGIC
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
            const snap = await getDocs(collection(db, 'users'));
            setAdminUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error("Admin fetch error", e); }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  const giftCredits = async (userId: string) => {
    if(!window.confirm("Gift Pro Plan (Unlimited)?")) return;
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { usageCount: 0, plan: 'pro' }); 
        alert("Grant Successful!");
    } catch (e) { alert("Grant failed"); }
  };

  // 3. RESEARCH LOGIC
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authLoaded) return;
    setLoading(true);
    setDossier(null);
    setSaved(false);

    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 1500));
      if (demoCredits > 0) {
        const newCredits = demoCredits - 1;
        setDemoCredits(newCredits);
        localStorage.setItem('sentient_demo_credits', newCredits.toString());
      }
      setLoading(false);
      setShowDemoModal(true);
      return;
    }

    try {
      if (!auth) throw new Error("Firebase Auth not initialized");
      const clerkToken = await getToken({ template: 'firebase' });
      const provider = new OAuthProvider('oidc.clerk'); 
      const credential = provider.credential({ idToken: clerkToken! });
      const firebaseResult = await signInWithCredential(auth, credential);
      const firebaseIdToken = await firebaseResult.user.getIdToken();

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${firebaseIdToken}` },
        body: JSON.stringify({ 
          prospectName: name, company, role,
          senderName: user?.fullName || "A Sales Professional",
          senderBusiness: userStats.businessName || "their professional services business"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
            if (window.confirm(data.error || "Daily limit reached.")) window.location.href = 'https://buy.stripe.com/bJeaEW6Xf2kp5Zc3qAdAk03';
        } else { alert(data.error || "Analysis failed."); }
        return;
      }
      setDossier(data);
      if (user) {
          const today = new Date().toISOString().split('T')[0];
          let currentCount = userStats.usageCount || 0;
          if (userStats.lastUsageDate !== today) currentCount = 0; 
          const newCount = currentCount + 1;
          await setDoc(doc(db, 'users', user.id), { usageCount: newCount, lastUsageDate: today, businessName: userStats.businessName || "" }, { merge: true });
          setUserStats(prev => ({ ...prev, usageCount: newCount, lastUsageDate: today }));
      }
    } catch (error: any) { alert(`System Error: ${error.message}`); } finally { setLoading(false); }
  };

  const handleSaveLead = async () => {
    if (!dossier || !user || isDemoMode) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'leads'), { userId: user.id, name, company, role, stage: 'New', dossier, value: 0, createdAt: new Date() });
      setSaved(true);
    } catch (error) { alert("Failed to save lead."); } finally { setSaving(false); }
  };

  const isPro = userStats.plan === 'pro' || userStats.plan === 'premium' || isAdmin;
  const limit = isPro ? 1000 : 3; 
  const creditsLeft = Math.max(0, limit - (userStats.usageCount || 0));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .print-container { padding: 40px !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>

      {/* MODALS */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-indigo-600" />
             <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Lock className="text-brand-600" size={32} /></div>
             <h2 className="text-2xl font-black mb-2 text-slate-900">Unlock Full Analysis</h2>
             <p className="text-slate-500 mb-8 leading-relaxed">Create a <b>free account</b> to run live, deep-dive research on real prospects immediately.</p>
             <div className="flex flex-col gap-3">
               <SignUpButton mode="modal"><button className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl shadow-lg">Start Free Account</button></SignUpButton>
               <SignInButton mode="modal"><button className="w-full py-3.5 bg-white border text-slate-600 font-bold rounded-xl">Log In</button></SignInButton>
             </div>
             <button onClick={() => setShowDemoModal(false)} className="mt-6 text-xs text-slate-400 underline">Back to Demo</button>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div className="bg-slate-900 rounded-2xl p-6 border-2 border-red-900 shadow-2xl mb-8 no-print text-white">
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowAdminPanel(!showAdminPanel)}>
            <div className="flex items-center gap-3"><Shield className="text-red-500" size={24} /><div><h2 className="font-black text-lg">COMMAND CENTER</h2></div></div>
            <button className="text-slate-400 text-sm">{showAdminPanel ? 'Collapse' : 'Expand'}</button>
          </div>
          {showAdminPanel && (
            <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/50 text-slate-500 uppercase text-xs"><tr><th className="p-3">User</th><th className="p-3">Usage</th><th className="p-3 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-700">{adminUsers.map(u => (<tr key={u.id} className="hover:bg-slate-700/50">
                  <td className="p-3 font-bold">{u.email}</td><td className="p-3 text-yellow-400 font-mono">{u.usageCount || 0}</td>
                  <td className="p-3 text-right"><button onClick={() => giftCredits(u.id)} className="text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold">Gift Pro</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HEADER & CREDITS */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border shadow-sm gap-4 no-print">
        <div><h1 className="text-2xl font-black">Research Center</h1><p className="text-slate-500 text-sm">Real-time intelligence via Sentient AI Engine.</p></div>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border">
            <div className="text-right px-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isPro ? 'Pro Agent' : 'Free Researcher'}</div>
                {isPro ? <div className="text-sm font-black text-brand-600 flex items-center gap-1">Unlimited Access <Zap size={12} className="fill-brand-600" /></div> : <div className={`text-sm font-black ${creditsLeft === 0 ? 'text-red-500' : 'text-slate-700'}`}>{creditsLeft} / {limit} Credits Left</div>}
            </div>
            {!isPro && <button onClick={() => window.location.href = 'https://buy.stripe.com/bJeaEW6Xf2kp5Zc3qAdAk03'} className="bg-brand-600 text-white py-2 px-3 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2"><CreditCard size={14} /> Upgrade</button>}
            {isPro && <div className="bg-amber-100 text-amber-600 p-2 rounded-lg"><CheckCircle2 size={18} /></div>}
        </div>
      </div>

      {/* BUSINESS SETTINGS */}
      {!isDemoMode && (
          <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex items-center gap-4 no-print">
              <div className="bg-brand-600 p-2 rounded-lg text-white"><Building2 size={20} /></div>
              <div className="flex-1">
                  <h3 className="text-xs font-bold text-brand-900 uppercase tracking-tight">My Business Name (For Signature)</h3>
                  <input className="w-full bg-transparent border-b border-brand-200 outline-none text-sm font-medium text-brand-800 focus:border-brand-500" value={userStats.businessName} onChange={async (e) => {
                        const val = e.target.value;
                        setUserStats(prev => ({ ...prev, businessName: val }));
                        if(user) await setDoc(doc(db, 'users', user.id), { businessName: val }, { merge: true });
                  }} />
              </div>
          </div>
      )}

      {/* INTERFACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 no-print">
          <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-6">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required /></div>
              <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-10 p-3 bg-slate-50 border rounded-xl" placeholder="Job Title" value={role} onChange={e => setRole(e.target.value)} /></div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} {loading ? 'Analyzing...' : 'Analyze Prospect'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
            {!dossier && !loading && (<div className="h-full flex flex-col items-center justify-center text-slate-300 bg-white rounded-2xl border border-dashed min-h-[400px]"><BrainCircuit size={48} className="mb-4 opacity-10" /><p>Enter details to generate AI dossier</p></div>)}
            {loading && (<div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border min-h-[400px] shadow-sm"><Loader2 size={48} className="animate-spin text-brand-500 mb-4" /><p className="font-bold">Scanning the live web...</p></div>)}
            
            {dossier && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="flex justify-end gap-3 no-print">
                        <button onClick={() => isPro ? handlePrint() : window.confirm("Exporting to PDF is a Pro Feature.\n\nUpgrade to Pro Agent to unlock?") && (window.location.href = 'https://buy.stripe.com/bJeaEW6Xf2kp5Zc3qAdAk03')} className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 border transition-all ${isPro ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-100 opacity-70 hover:opacity-100"}`}>{isPro ? <Printer size={16} /> : <Lock size={14} />}{isPro ? "Save PDF" : "Unlock PDF"}</button>
                        <button onClick={handleSaveLead} disabled={saving || saved} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-brand-500/20">{saved ? 'Saved' : 'Save Lead'}</button>
                    </div>

                    <div ref={componentRef} className="print-container">
                      <div className="hidden print:block mb-8 border-b pb-4"><h1 className="text-3xl font-black text-slate-900">{name}</h1><p className="text-slate-500">{role} at {company}</p></div>
                      
                      <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-500 shadow-sm mb-6 print:border print:shadow-none"><div className="flex items-center gap-2 mb-3 text-brand-600"><BrainCircuit size={20} /><h4 className="text-[10px] font-black uppercase tracking-widest">Psychological Profile</h4></div><p className="text-slate-700 leading-relaxed">{renderSafe(dossier.personality)}</p></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 print:bg-white"><div className="flex items-center gap-2 mb-4 text-red-600"><Target size={20} /><h4 className="text-[10px] font-black uppercase tracking-widest">Pain Points</h4></div><ul className="space-y-2">{safeList(dossier.painPoints).map((p, i) => (<li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-red-400">•</span>{p}</li>))}</ul></div>
                          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 print:bg-white"><div className="flex items-center gap-2 mb-4 text-blue-600"><MessageCircle size={20} /><h4 className="text-[10px] font-black uppercase tracking-widest">Ice Breakers</h4></div><ul className="space-y-2">{safeList(dossier.iceBreakers).map((p, i) => (<li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-blue-400">•</span>{p}</li>))}</ul></div>
                      </div>

                      {/* EMAIL DRAFT WITH EXPORT BUTTONS */}
                      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl print:bg-white print:text-black print:border print:shadow-none relative group/email">
                          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4 print:border-slate-200">
                              <div className="flex items-center gap-2 text-slate-400 print:text-black"><Mail size={20} /><h4 className="text-[10px] font-black uppercase tracking-widest">Draft Email</h4></div>
                              <div className="flex gap-2 no-print">
                                  <button onClick={() => {
                                      const text = renderSafe(dossier.emailDraft).split(/Best regards|Sincerely|Kind regards|Best, \[Your Name\]/i)[0].trim() + `\n\nBest,\n${user?.fullName || "Sanderson Labousse"}\n${userStats.businessName || "Sentient Prospect"}`;
                                      navigator.clipboard.writeText(text); alert("Draft copied to clipboard!");
                                  }} className="p-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors" title="Copy"><Download size={16} /></button>
                                  <button onClick={() => {
                                      const subject = encodeURIComponent(`Connecting regarding ${company}`);
                                      const body = encodeURIComponent(renderSafe(dossier.emailDraft).split(/Best regards|Sincerely|Kind regards|Best, \[Your Name\]/i)[0].trim() + `\n\nBest,\n${user?.fullName || "Sanderson Labousse"}\n${userStats.businessName || "Sentient Prospect"}`);
                                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                  }} className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 shadow-lg shadow-brand-500/20" title="Email"><Mail size={16} /></button>
                              </div>
                          </div>
                          
                          <div className="text-slate-300 font-mono text-sm whitespace-pre-wrap print:text-black">
                              {renderSafe(dossier.emailDraft).split(/Best regards|Sincerely|Kind regards|Best, \[Your Name\]/i)[0].trim()}
                              <div className="mt-8 pt-6 border-t border-slate-800 print:border-slate-200">
                                  <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Sent via Sentient AI</p>
                                  <p className="text-white font-bold print:text-black">{user?.fullName || "Sanderson Labousse"}</p>
                                  <p className="text-brand-400 font-medium print:text-slate-600">{userStats.businessName || "Sentient Prospect"}</p>
                              </div>
                          </div>
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