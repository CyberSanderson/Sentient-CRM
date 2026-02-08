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
// Added doc, getDoc, setDoc, updateDoc for credit management
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; 
import { db } from './lib/firebase'; 

// --- VIEWS ---
import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import PipelineView from './views/PipelineView'; 
import LandingPage from './views/LandingPage';

import { View, Lead, LeadStage } from './types';
import { APP_NAME } from './constants';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const SentientApp = () => {
  const { user, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]); 
  const [userProfile, setUserProfile] = useState<any>(null); // 👈 Track credits here

  // --- 🛡️ NEW: SYNC USER & LISTEN TO CREDITS ---
  useEffect(() => {
    if (!user || isDemoMode) return;

    const syncAndListen = async () => {
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      const today = new Date().toISOString().split('T')[0];

      // If new user, create their "Bank Account" with 3 credits
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.primaryEmailAddress?.emailAddress,
          plan: 'free',
          credits: 3,
          lastResetDate: today,
          createdAt: new Date()
        });
      }

      // Real-time listener for credits (so UI updates instantly)
      return onSnapshot(userRef, (doc) => {
        setUserProfile(doc.data());
      });
    };

    const unsubProfile = syncAndListen();

    // Your existing Leads Listener
    const q = query(collection(db, "leads"), where("userId", "==", user.id));
    const unsubLeads = onSnapshot(q, (snapshot) => {
      const loadedLeads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(loadedLeads);
    });

    return () => { 
      unsubLeads();
      if (typeof unsubProfile === 'function') unsubProfile();
    };
  }, [user, isDemoMode]);

  const handleLogout = () => {
    setIsDemoMode(false);
    if (!isDemoMode) signOut();
    setCurrentView('dashboard');
  };

  if (!isSignedIn && !isDemoMode) {
    return <LandingPage onLoginClick={openSignIn} onSignupClick={openSignUp} onDemoClick={() => setIsDemoMode(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-brand-600 p-2 rounded-lg shadow-lg shadow-brand-500/20">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" icon={Search} label="Research" current={currentView} set={setCurrentView} />
          <NavItem view="pipeline" icon={Trello} label="Pipeline" current={currentView} set={setCurrentView} />
          <NavItem view="leads" icon={Users} label="Prospects" current={currentView} set={setCurrentView} />
        </nav>

        {/* 💳 CREDIT UI BLOCK (Visualizes the Monetization) */}
        <div className="px-4 mb-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credits</span>
              <Zap size={12} className="text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-2xl font-black mb-1">
              {userProfile?.credits ?? 0} <span className="text-xs text-slate-500 font-normal">/ 3</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-brand-500 h-full transition-all duration-1000" 
                style={{ width: `${((userProfile?.credits || 0) / 3) * 100}%` }}
              />
            </div>
            <button className="w-full py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-colors">
              Upgrade to Unlimited
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.firstName?.[0] || 'U'}
            </div>
            <p className="text-sm font-medium truncate flex-1">{user?.fullName || 'User'}</p>
            <LogOut size={16} onClick={handleLogout} className="text-slate-400 hover:text-red-500 cursor-pointer" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
             {currentView === 'dashboard' && <DashboardView leads={leads} />}
             {currentView === 'pipeline' && <PipelineView leads={leads} />}
             {currentView === 'leads' && <LeadsView leads={leads} />}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper component
const NavItem = ({ view, icon: Icon, label, current, set }: any) => (
  <button
    onClick={() => set(view)}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
      current === view ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <SentientApp />
  </ClerkProvider>
);

export default App;