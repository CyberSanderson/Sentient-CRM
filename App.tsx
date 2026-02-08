import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Trello, 
  Settings, 
  Menu, 
  X, 
  Bot,
  LogOut,
  Search,
  Zap
} from 'lucide-react';
import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";
// Added getDoc, setDoc, updateDoc, increment
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; 
import { db } from './lib/firebase'; 

import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import PipelineView from './views/PipelineView'; 
import LandingPage from './views/LandingPage';

import { View, Lead, LeadStage } from './types';
import { APP_NAME } from './constants';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

const SentientApp = () => {
  const { user, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [leads, setLeads] = useState<Lead[]>([]); 
  const [userProfile, setUserProfile] = useState<any>(null); // 👈 For credits

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  // --- 🔄 SYNC USER & LISTEN TO CREDITS ---
  useEffect(() => {
    if (!user || isDemoMode) return;

    const syncUser = async () => {
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      const today = new Date().toISOString().split('T')[0];

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.primaryEmailAddress?.emailAddress,
          plan: 'free',
          credits: 3,
          createdAt: new Date(),
          lastResetDate: today
        });
      }
    };

    syncUser();

    // Listen to user profile (credits) in real-time
    const unsubUser = onSnapshot(doc(db, 'users', user.id), (doc) => {
      setUserProfile(doc.data());
    });

    // Listen for leads
    const q = query(collection(db, "leads"), where("userId", "==", user.id));
    const unsubLeads = onSnapshot(q, (snapshot) => {
      const loadedLeads = snapshot.docs.map(doc => {
        const data = doc.data();
        let validDate = new Date();
        if (data.createdAt) {
           if (typeof data.createdAt.toDate === 'function') {
             validDate = data.createdAt.toDate(); 
           } else {
             validDate = new Date(data.createdAt); 
           }
        }
        return {
          id: doc.id,
          company: data.company || "Unknown Company",
          name: data.name || data.contactName || "Unknown Contact",
          stage: (data.status as LeadStage) || "New", 
          value: data.value || 0,
          lastContact: validDate,
          aiScore: data.aiScore || 50,
          email: data.email || "",
          role: data.role || "",
          dossier: data.dossier || null,
          ...data 
        };
      }) as Lead[];
      setLeads(loadedLeads);
    });

    return () => { unsubUser(); unsubLeads(); };
  }, [user, isDemoMode]);

  const handleLogout = () => {
    setIsDemoMode(false);
    if (!isDemoMode) signOut();
    setCurrentView('dashboard');
    setLeads([]);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
        currentView === view 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!isSignedIn && !isDemoMode) {
    return <LandingPage onLoginClick={() => openSignIn()} onSignupClick={() => openSignUp()} onDemoClick={() => setIsDemoMode(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-2 rounded-lg shadow-lg">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="dashboard" icon={Search} label="Research" />
          <NavItem view="pipeline" icon={Trello} label="Pipeline" />
          <NavItem view="leads" icon={Users} label="Prospects" />
        </nav>

        {/* 💳 CREDIT UI BLOCK */}
        <div className="px-4 mb-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl shadow-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credits</span>
              <Zap size={12} className="text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-2xl font-black mb-1">
              {userProfile?.credits ?? 0}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-brand-500 h-full transition-all duration-1000" 
                style={{ width: `${((userProfile?.credits || 0) / 3) * 100}%` }}
              />
            </div>
            <button className="w-full py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-xs font-bold transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.firstName?.[0] || 'U'}
            </div>
            <p className="text-sm font-medium truncate flex-1">{user?.fullName || 'User'}</p>
            <button onClick={handleLogout}><LogOut size={16} className="text-slate-400 hover:text-red-500" /></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <DashboardView leads={leads} />}
            {currentView === 'pipeline' && <PipelineView leads={leads} setLeads={setLeads} />}
            {currentView === 'leads' && <LeadsView leads={leads} setLeads={setLeads} />}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <SentientApp />
  </ClerkProvider>
);

export default App;