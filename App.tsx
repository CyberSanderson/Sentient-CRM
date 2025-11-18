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
import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import PipelineView from './views/PipelineView';
import LandingPage from './views/LandingPage';
import AuthModal from './components/AuthModal';
import { View, Lead } from './types';
import { MOCK_LEADS, APP_NAME } from './constants';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // App State
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu on view change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setCurrentView('dashboard');
  };

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsDemoMode(false);
    setAuthModalOpen(false);
  };

  const handleDemoAccess = () => {
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setAuthModalOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView leads={leads} />;
      case 'pipeline':
        return <PipelineView leads={leads} setLeads={setLeads} />;
      case 'leads':
        return <LeadsView leads={leads} setLeads={setLeads} />;
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-fade-in">
            <Settings size={64} className="mb-4 opacity-20" />
            <p className="text-lg">Settings & Configuration coming soon.</p>
          </div>
        );
      default:
        return <DashboardView leads={leads} />;
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

  // If not authenticated, show Landing Page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage 
          onLoginClick={openLogin} 
          onSignupClick={openSignup} 
          onDemoClick={handleDemoAccess}
        />
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          onLogin={handleAuthSuccess}
          initialMode={authMode}
        />
      </>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="flex h-screen supports-[height:100dvh]:h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
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
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="pipeline" icon={Trello} label="Pipeline" />
          <NavItem view="leads" icon={Users} label="Leads" />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem view="settings" icon={Settings} label="Settings" />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {isDemoMode ? 'D' : 'JS'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{isDemoMode ? 'Demo User' : 'John Smith'}</p>
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
        {/* Demo Banner */}
        {isDemoMode && (
          <div className="bg-indigo-50 text-indigo-700 text-xs font-medium py-1 px-4 text-center border-b border-indigo-100 flex items-center justify-center gap-2">
            <Eye size={14} />
            You are viewing a live demo. Data is reset upon exit.
            <button onClick={handleLogout} className="underline hover:text-indigo-900 ml-2">Exit Demo</button>
          </div>
        )}

        {/* Mobile Header */}
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

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-white/95 backdrop-blur-sm pt-20 px-4 animate-fade-in">
            <nav className="space-y-2">
              <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem view="pipeline" icon={Trello} label="Pipeline" />
              <NavItem view="leads" icon={Users} label="Leads" />
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

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          <div className="max-w-7xl mx-auto h-full pb-20 md:pb-0">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;