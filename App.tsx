import React, { useState, useEffect } from 'react';
import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";
import { doc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore'; 
import { db } from './lib/firebase'; 
import { Loader2 } from 'lucide-react';

// --- VIEWS ---
import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import PipelineView from './views/PipelineView'; 
import LandingPage from './views/LandingPage'; // Ensure this path matches your file structure
import PricingView from './views/PricingView';
import AdminView from './views/AdminView'; // 👈 God Mode View

// --- COMPONENTS ---
import { Sidebar } from './components/Sidebar';

// --- LEGAL PAGES ---
import PrivacyPage from './views/Privacy/PrivacyPage';
import TermsPage from './views/Terms/TermsPage';
import RefundsPage from './views/Refunds/RefundsPage';

import { View, Lead } from './types';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const SentientApp = () => {
  const { user, isLoaded, isSignedIn } = useUser();
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
          alert("🎉 PAYMENT SUCCESSFUL! You are now a Pro user with 100 credits.");
          window.location.reload();
        } catch (error) {
          console.error("Error upgrading user:", error);
        }
      }
    };

    // B. Listen to Leads
    const q = query(collection(db, "leads"), where("userId", "==", user.id));
    const unsubLeads = onSnapshot(q, (snapshot) => {
      const loadedLeads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(loadedLeads);
    });

    handleUpgrade();

    return () => { 
      unsubLeads();
    };
  }, [user, isDemoMode]);

  // 4. LOADING STATE
  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" /></div>;

  // 5. ROUTING VIEW RENDERER
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView leads={leads} isDemoMode={isDemoMode} />;
      case 'pipeline':  return <PipelineView leads={leads} />;
      case 'leads':     return <LeadsView leads={leads} />;
      case 'pricing':   return <PricingView />;
      case 'admin':     return <AdminView />; // 👈 God Mode Routing
      case 'privacy':   return <PrivacyPage onBack={() => setCurrentView('dashboard')} />;
      case 'terms':     return <TermsPage onBack={() => setCurrentView('dashboard')} />;
      case 'refunds':   return <RefundsPage onBack={() => setCurrentView('dashboard')} />;
      default:          return <DashboardView leads={leads} isDemoMode={isDemoMode} />;
    }
  };

  // 6. LANDING PAGE GATE (Fixed Login Logic)
  const isLegalView = ['privacy', 'terms', 'refunds'].includes(currentView);

  if (!isSignedIn && !isDemoMode && !isLegalView) {
    return (
      <LandingPage 
        onLoginClick={openSignIn}       // 👈 Passes the login function
        onSignupClick={openSignUp}      // 👈 Passes the signup function
        onDemoStart={() => setIsDemoMode(true)} // (Might be onDemoClick depending on your file)
        // If your LandingPage uses onDemoClick instead, swap the line above for:
        // onDemoClick={() => setIsDemoMode(true)}
      />
    );
  }

  // 7. MAIN APP LAYOUT
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 h-full overflow-y-auto pb-24 md:pb-0">
        <div className={`mx-auto h-full ${isLegalView ? 'max-w-none p-0' : 'max-w-7xl'}`}>
            {renderView()}
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