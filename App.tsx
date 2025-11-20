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
  Eye
} from 'lucide-react';
import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'; // New Imports
import { db } from './lib/firebase'; // Import Database

import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import PipelineView from './views/PipelineView';
import LandingPage from './views/LandingPage';
import { View, Lead } from './types';
import { APP_NAME } from './constants';

// 2. Get the key securely
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

// Inner Component (Where the logic lives)
const SentientApp = () => {
  // Clerk State
  const { user, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  
  // App State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // DATA STATE: Start empty, we will fill this from the DB
  const [leads, setLeads] = useState<Lead[]>([]); 

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  // --- NEW: REAL-TIME DATABASE LISTENER ---
  useEffect(() => {
    // If we are in demo mode or not logged in, don't fetch real data
    if (!user || isDemoMode) {
      return;
    }

    // Query: "Give me all leads that belong to THIS user"
    const q = query(
      collection(db, "leads"),
      where("userId", "==", user.id)
      // Note: orderBy might require a Firebase Index later, keeping it simple for now
    );

    // This listens for changes in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedLeads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      setLeads(loadedLeads);
    });

    return () => unsubscribe();
  }, [user, isDemoMode]);
  // --- END NEW LOGIC ---

  const handleDemoAccess = () => {
    setIsDemoMode(true);
    // In demo mode, we could load mock leads if we wanted, 
    // but for now let's start fresh or keep the state logic simple.
  };

  const handleLogout = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
    } else {
      signOut();
    }
    setCurrentView('dashboard');
    setLeads([]); // Clear data on logout
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView leads={leads} />;
      case 'pipeline': return <PipelineView leads={leads} setLeads={setLeads} />;
      case 'leads': return <LeadsView leads={leads} setLeads={setLeads} />;
      case 'settings': return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-fade-in">
            <Settings size={64} className="mb-4 opacity-20" />
            <p className="text-lg">Settings & Configuration coming soon.</p>
            <p className="text-xs mt-2">User ID: {user?.id}</p>
          </div>
        );
      default: return <DashboardView leads={leads} />;
    }
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
    return (
      <LandingPage 
        onLoginClick={() => openSignIn()} 
        onSignupClick={() => openSignUp()} 
        onDemoClick={handleDemoAccess}
      />
    );
  }

  return (
    <div className="flex h-screen supports-[height:100dvh]:h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm z-10">
        <div 
          className="p-6 flex items-center gap-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setCurrentView('dashboard')}
        >
          <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-2 rounded-lg shadow-lg shadow-brand-500/20">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
            {APP_NAME}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" icon={Search} label="Research" />
          <NavItem view="pipeline" icon={Trello} label="Pipeline" />
          <NavItem view="leads" icon={Users} label="Prospects" />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem view="settings" icon={Settings} label="Settings" />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {isDemoMode ? 'D' : (user?.firstName ? user.firstName[0] : user?.emailAddresses[0].emailAddress[0].toUpperCase())}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {isDemoMode ? 'Demo User' : (user?.fullName || user?.emailAddresses[0].emailAddress)}
              </p>
              <p className="text-xs text-slate-500 truncate">{isDemoMode ? 'Viewer' : 'Admin'}</p>
            </div>
            <button onClick={handleLogout} title="Logout">
              <LogOut size={16} className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
        {isDemoMode && (
          <div className="bg-indigo-50 text-indigo-700 text-xs font-medium py-1 px-4 text-center border-b border-indigo-100 flex items-center justify-center gap-2">
            <Eye size={14} />
            You are viewing a live demo. Data is reset upon exit.
            <button onClick={handleLogout} className="underline hover:text-indigo-900 ml-2">Exit Demo</button>
          </div>
        )}

        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md z-30 relative">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
             <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-1.5 rounded-lg shadow-md">
                <Bot className="text-white" size={20} />
              </div>
            <span className="font-bold text-lg text-slate-900">{APP_NAME}</span>
          </div>
          <button onClick={toggleMobileMenu} className="p-2 text-slate-500 hover:text-slate-900">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-white/95 backdrop-blur-sm pt-20 px-4 animate-fade-in">
            <nav className="space-y-2">
              <NavItem view="dashboard" icon={Search} label="Research" />
              <NavItem view="pipeline" icon={Trello} label="Pipeline" />
              <NavItem view="leads" icon={Users} label="Prospects" />
              <NavItem view="settings" icon={Settings} label="Settings" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 mt-4 border-t border-slate-100"
              >
                <LogOut size={20} />
                <span className="font-medium">Log Out</span>
              </button>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          <div className="max-w-7xl mx-auto h-full pb-20 md:pb-0">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

// Wrap and Export
const App = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SentientApp />
    </ClerkProvider>
  );
};
// Need Search Icon for the new menu item name
import { Search } from 'lucide-react'; 

export default App;