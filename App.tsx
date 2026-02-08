import React, { useEffect, useState } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignIn, 
  UserButton, 
  useUser 
} from "@clerk/clerk-react";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  ShieldAlert 
} from "lucide-react";
import DashboardView from './views/DashboardView';
import PipelineView from './views/PipelineView';
import LeadsView from './views/LeadsView';
import AdminView from './views/AdminView';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './lib/firebase';
import { UserProfile, Lead } from './types';

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-brand-50 text-brand-600 font-bold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function App() {
  const { user, isLoaded } = useUser();
  const [currentView, setCurrentView] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 🔄 1. SYNC USER TO FIREBASE (With Debugging Logs)
  useEffect(() => {
    const syncUser = async () => {
      if (!user) return;
      
      console.log("🔄 Attempting to sync user:", user.id); // Debug Log

      try {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        const today = new Date().toISOString().split('T')[0];

        if (userSnap.exists()) {
          console.log("✅ User exists in DB. Checking daily reset...");
          const data = userSnap.data() as UserProfile;
          if (data.lastResetDate !== today) {
            await updateDoc(userRef, {
              credits: data.plan === 'free' ? 3 : 100,
              lastResetDate: today
            });
            console.log("♻️ Credits reset for new day.");
          }
          setUserProfile(data);
        } else {
          console.log("🆕 New User detected! Creating DB profile...");
          const newProfile: UserProfile = {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            plan: 'free',
            credits: 3,
            dossiersGenerated: 0,
            lastResetDate: today,
            createdAt: new Date()
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
          console.log("✨ User Profile Created Successfully!");
        }
      } catch (error) {
        console.error("❌ Error syncing user:", error);
      }
    };

    if (isLoaded && user) {
      syncUser();
    }
  }, [user, isLoaded]);

  // 🔄 2. REAL-TIME LEADS LISTENER (Fixes Pipeline not seeing data)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'leads'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(leadsData);
    });

    return () => unsubscribe();
  }, [user]);

  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <SignedOut>
        <div className="h-screen flex items-center justify-center bg-slate-900">
           <div className="bg-white p-2 rounded-2xl">
              <SignIn routing="hash" /> 
           </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Sentient</span>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              <NavItem 
                icon={<LayoutDashboard size={20} />} 
                label="Research" 
                active={currentView === 'dashboard'} 
                onClick={() => setCurrentView('dashboard')} 
              />
              <NavItem 
                icon={<KanbanSquare size={20} />} 
                label="Pipeline" 
                active={currentView === 'pipeline'} 
                onClick={() => setCurrentView('pipeline')} 
              />
              <NavItem 
                icon={<Users size={20} />} 
                label="Leads" 
                active={currentView === 'leads'} 
                onClick={() => setCurrentView('leads')} 
              />
              
              {/* ADMIN BUTTON: Replace with your email */}
              {user?.primaryEmailAddress?.emailAddress === 'YOUR_EMAIL@gmail.com' && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">Admin</p>
                  <NavItem 
                    icon={<ShieldAlert size={20} />} 
                    label="User Management" 
                    active={currentView === 'admin'} 
                    onClick={() => setCurrentView('admin')} 
                  />
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-slate-100">
               {userProfile && (
                 <div className="mb-4 px-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                     <span>Daily Credits</span>
                     <span>{userProfile.credits} / {userProfile.plan === 'free' ? 3 : '∞'}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${userProfile.credits === 0 ? 'bg-red-500' : 'bg-brand-500'}`} 
                        style={{ width: `${(userProfile.credits / (userProfile.plan === 'free' ? 3 : 100)) * 100}%` }}
                      />
                   </div>
                 </div>
               )}
              <div className="flex items-center gap-3 px-2">
                <UserButton />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{user?.fullName}</span>
                  <span className="text-xs text-slate-500 capitalize">{userProfile?.plan || 'Free'} Plan</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="max-w-7xl mx-auto p-8">
              {currentView === 'dashboard' && <DashboardView leads={leads} />}
              {currentView === 'pipeline' && <PipelineView leads={leads} />}
              {currentView === 'leads' && <LeadsView leads={leads} />}
              {currentView === 'admin' && <AdminView />}
            </div>
          </main>
        </div>
      </SignedIn>
    </div>
  );
}

export default App;