import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  LogOut, 
  MoreHorizontal,
  Sparkles,
  Rocket,
  Shield // 👈 Admin Icon
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react'; 
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { signOut } = useClerk();
  const { user } = useUser(); 
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // 🔒 ADMIN CHECK: Replace with your actual email
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "lifeinnovations7@gmail.com"; 

  // Helper for Desktop Nav Items
  const DesktopItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        currentView === view 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  // Helper for Mobile Bottom Nav Items
  const MobileItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        onViewChange(view);
        setIsMoreOpen(false);
      }}
      className={`flex flex-col items-center justify-center p-2 flex-1 ${
        currentView === view ? 'text-brand-500' : 'text-slate-400'
      }`}
    >
      <Icon size={24} className={currentView === view ? 'fill-brand-500/20' : ''} />
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );

  return (
    <>
      {/* 📱 MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-50 flex items-center justify-around pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileItem view="dashboard" icon={LayoutDashboard} label="Research" />
        <MobileItem view="pipeline" icon={KanbanSquare} label="Pipeline" />
        <MobileItem view="leads" icon={Users} label="Leads" />
        
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center p-2 flex-1 ${isMoreOpen ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <MoreHorizontal size={24} />
          <span className="text-[10px] font-bold mt-1">More</span>
        </button>
      </div>

      {/* 📱 MOBILE MORE DRAWER */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)}>
          <div className="absolute bottom-24 right-4 w-64 bg-white rounded-2xl shadow-2xl p-4 animate-fade-in-up">
            
            {/* 🔒 ADMIN BUTTON (Mobile) */}
            {isAdmin && (
               <button 
                onClick={() => { onViewChange('admin'); setIsMoreOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-700 font-bold mb-2 border border-red-100"
              >
                <Shield size={18} /> Command Center
              </button>
            )}

            <div className="mb-4 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Account</h3>
              <button 
                onClick={() => { onViewChange('pricing'); setIsMoreOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-brand-50 text-brand-700 font-bold mb-2"
              >
                <Rocket size={18} /> Upgrade Plan
              </button>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* 🖥️ DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-72 bg-slate-900 text-white p-6 flex-col border-r border-slate-800 h-screen sticky top-0">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-3 mb-10">
          {/* 👇 LOGO IMAGE */}
          <img 
            src="/sentient-prospect-logo.png" 
            alt="Sentient Logo" 
            className="h-10 w-auto object-contain" 
          />
          {/* Text is optional - remove if your logo already has text */}
          <span className="text-xl font-bold tracking-tight text-white">
            SENTIENT
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <DesktopItem view="dashboard" icon={LayoutDashboard} label="Research Center" />
          <DesktopItem view="pipeline" icon={KanbanSquare} label="Deals Pipeline" />
          <DesktopItem view="leads" icon={Users} label="Lead Database" />
          
          {/* 🔒 ADMIN BUTTON (Desktop) */}
          {isAdmin && (
            <>
              <div className="my-4 border-t border-slate-800" />
              <DesktopItem view="admin" icon={Shield} label="Command Center" />
            </>
          )}

        </nav>
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <button
             onClick={() => onViewChange('pricing')}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold border bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-transparent shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
          >
            <Rocket size={18} /> Upgrade Plan
          </button>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-slate-800/50 rounded-xl transition-all font-medium">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};