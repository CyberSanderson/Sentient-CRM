import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trello, 
  Bot,
  LogOut,
  Search,
  Zap 
} from 'lucide-react';
import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db } from './lib/firebase'; 

// --- VIEWS ---
import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import PipelineView from './views/PipelineView'; 
import LandingPage from './views/LandingPage';
import PricingView from './views/PricingView';

// --- LEGAL PAGES ---
import PrivacyPage from './views/Privacy/PrivacyPage';
import TermsPage from './views/Terms/TermsPage';
import RefundsPage from './views/Refunds/RefundsPage';

import { View, Lead } from './types';
import { APP_NAME } from './constants';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const SentientApp = () => {
  const { user, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  
  // 1. 🧠 SEO ROUTING: Check URL on load
  const getInitialView = (): View => {
    const path = window.location.pathname.replace('/', '');
    if (['privacy', 'terms', 'refunds'].includes(path)) {
      return path as View;
    }
    return 'dashboard';
  };

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>(getInitialView());
  const [leads, setLeads] = useState<Lead[]>([]); 
  const [userProfile, setUserProfile] = useState<any>(null);

  // 2. 🔗 URL SYNC: Update URL when view changes
  useEffect(() => {
    const path = window.location.pathname;
    if (currentView === 'dashboard' && path !== '/') {
      window.history.pushState(null, '', '/');
    } else if (['privacy', 'terms', 'refunds'].includes(currentView)) {
      window.history.pushState(null, '', `/${currentView}`);
    }
  }, [currentView]);

  // 3. 🛡️ DATA SYNC & STRIPE UPGRADES
  useEffect(() => {
    if (!user || isDemoMode) return;

    // A. Handle Stripe Payment Success
    const handleUpgrade = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        try {
          const userRef = doc(db, 'users', user.id);
          // Upgrade to 'pro' + 100 credits
          await setDoc(userRef, { 
            plan: 'pro', 
            credits: 100,
            updatedAt: new Date()
          }, { merge: true });
          
          // Clear URL
          window.history.replaceState({}, document.title, "/");
          alert("Payment successful! You are now a Pro user with 100 credits.");
        } catch (error) {
          console.error("Error upgrading user:", error);
        }
      }
    };

    // B. Sync User Profile
    const syncAndListen = async () => {
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      const today = new Date().toISOString().split('T')[0];

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.primaryEmailAddress?.emailAddress,
          plan: 'free',
          credits: 3,
          lastResetDate: today,
          createdAt: new Date()
        });
      }

      return onSnapshot(userRef, (doc) => {
        setUserProfile(doc.data());
      });
    };

    // Execute Logic
    handleUpgrade();
    let unsubProfile: any;
    syncAndListen().then(unsub => unsubProfile = unsub);

    // C. Listen to Leads
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
      if (unsubProfile) unsubProfile();
    };
  }, [user, isDemoMode]);

  const handleLogout = () => {
    setIsDemoMode(false);
    if (!isDemoMode) signOut();
    setCurrentView('dashboard');
  };

  // 4. ROUTER VIEW
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView leads={leads} isDemoMode={isDemoMode} />;
      case 'pipeline':  return <PipelineView leads={leads} />;
      case 'leads':     return <LeadsView leads={leads} />;
      case 'pricing':   return <PricingView />;
      case 'privacy':   return <PrivacyPage onBack={() => setCurrentView(isSignedIn ? 'dashboard' : 'dashboard')} />;
      case 'terms':     return <TermsPage onBack={() => setCurrentView(isSignedIn ? 'dashboard' : 'dashboard')} />;
      case 'refunds':   return <RefundsPage onBack={() => setCurrentView(isSignedIn ? 'dashboard' : 'dashboard')} />;
      default:          return <DashboardView leads={leads} isDemoMode={isDemoMode} />;
    }
  };

  // 5. LANDING PAGE GATE
  const isLegalView = ['privacy', 'terms', 'refunds'].includes(currentView);

  if (!isSignedIn && !isDemoMode && !isLegalView) {
    return (
      <LandingPage 
        onLoginClick={openSignIn} 
        onSignupClick={openSignUp} 
        onDemoClick={() => setIsDemoMode(true)} 
        setCurrentView={setCurrentView} 
      />
    );
  }

  // 6. MAIN APP LAYOUT
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {!isLegalView && (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm z-10">
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Bot className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem view="dashboard" icon={Search} label="Research" current={currentView} set={setCurrentView} />
            <NavItem view="pipeline" icon={Trello} label="Pipeline" current={currentView} set={setCurrentView} />
            <NavItem view="leads" icon={Users} label="Prospects" current={currentView} set={setCurrentView} />
          </nav>

          <div className="px-4 mb-4">
            <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credits</span>
                <Zap size={12} className="text-yellow-400 fill-yellow-400" />
              </div>
              <div className="text-2xl font-black mb-1">
                {isDemoMode ? '∞' : (userProfile?.credits ?? 0)} 
                <span className="text-xs text-slate-500 font-normal ml-1">/ 3</span>
              </div>
              <button 
                onClick={() => setCurrentView('pricing')}
                className="w-full mt-2 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-[10px] font-bold uppercase transition-colors"
              >
                Upgrade to Unlimited
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {isDemoMode ? 'D' : (user?.firstName?.[0] || 'U')}
              </div>
              <p className="text-sm font-medium truncate flex-1">{isDemoMode ? 'Demo User' : (user?.fullName || 'User')}</p>
              <LogOut size={16} onClick={handleLogout} className="text-slate-400 hover:text-red-500 cursor-pointer" />
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4 md:p-8">
          <div className={`mx-auto h-full ${isLegalView ? 'max-w-none p-0' : 'max-w-7xl'}`}>
             {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ view, icon: Icon, label, current, set }: any) => (
  <button
    onClick={() => set(view)}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
      current === view ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
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