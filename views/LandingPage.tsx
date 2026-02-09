import React, { useState } from 'react';
import { 
  Bot, Check, Star, ArrowRight, Zap, Shield, BarChart3, 
  Globe, Menu, X, Cpu, LayoutGrid 
} from 'lucide-react';
import { 
  APP_NAME, TESTIMONIALS, PRICING_TIERS, 
  TRUSTED_COMPANIES, INTEGRATIONS 
} from '../constants';
import { View } from '../types';
import Footer from '../components/Footer';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onDemoClick: () => void;
  setCurrentView: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onLoginClick, onSignupClick, onDemoClick, setCurrentView 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to scroll to specific sections inside the scrollable container
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Helper to scroll to top
  const scrollToTop = () => {
    // We target the main container ID 'landing-scroll-container'
    const container = document.getElementById('landing-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    // 🚀 SCROLL FIX: 'h-screen overflow-y-auto' creates a scrollable window independent of the body
    <div 
      id="landing-scroll-container"
      className="h-screen w-full bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white overflow-y-auto overflow-x-hidden scroll-smooth"
    >
      
      {/* 1. NAVIGATION */}
      {/* sticky top-0 ensures it stays visible while scrolling within this container */}
      <nav className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={scrollToTop}>
              <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-1.5 rounded-lg shadow-lg">
                <Bot className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Sentient Prospect</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-brand-600">Features</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-medium text-slate-600 hover:text-brand-600">Pricing</a>
              <div className="flex items-center gap-4 ml-4 border-l border-slate-200 pl-8">
                <button onClick={onLoginClick} className="text-sm font-medium text-slate-600 hover:text-brand-600">Log in</button>
                <button onClick={onSignupClick} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-500/25">Start Free</button>
              </div>
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4 shadow-xl">
             <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="block text-base font-medium text-slate-700">Features</a>
             <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="block text-base font-medium text-slate-700">Pricing</a>
             <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <button onClick={onLoginClick} className="w-full py-3 bg-slate-100 text-slate-900 rounded-lg font-medium">Log In</button>
                <button onClick={onSignupClick} className="w-full py-3 bg-brand-600 text-white rounded-lg font-medium shadow-brand-500/20 shadow-lg">Sign Up</button>
             </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* 🚀 RESTORED: Gemini Badge & Stars */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-semibold shadow-sm">
              <Zap size={14} className="fill-brand-500 text-brand-500" />
              <span>Gemini 2.5 Integration Live</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-amber-400" />)}
                <span className="text-slate-600 text-sm ml-2 font-medium">Rated 4.9/5 by 500+ Sales Teams</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
            Close Deals Faster with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">Sentient Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Stop guessing. Start closing. Sentient Prospect uses advanced AI to score leads, draft personalized emails, and predict pipeline health in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button onClick={onSignupClick} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={20} />
            </button>
            <button onClick={onDemoClick} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 text-lg font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all group">
              View Live Demo <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY */}
      <div className="border-y border-slate-100 bg-slate-50/50 py-12">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Trusted by revenue teams at</p>
        <div className="flex justify-center items-center gap-12 md:gap-20 flex-wrap px-4 opacity-40 grayscale">
          {TRUSTED_COMPANIES.map((company, i) => (
            <span key={i} className="text-xl md:text-2xl font-bold text-slate-500 tracking-tighter">{company}</span>
          ))}
        </div>
      </div>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Superpowers for Sales Teams</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Built for modern sales motions. Powered by next-gen large language models.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-brand-200 transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Predictive Scoring</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Stop wasting time on dead leads. Our AI analyzes data points to score prospects on likelihood to close.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-brand-200 transition-all">
               <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Auto-Drafting</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Generate hyper-personalized cold outreach and follow-ups in seconds. The AI learns your voice.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-brand-200 transition-all">
               <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Insights</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Get a daily briefing of your pipeline health, risks, and opportunities. 24/7 sales analyst.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 pb-40 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Simple Pricing</h2>
            <p className="text-slate-500">Free to start. Pro for the closers.</p>
          </div>
          
          {/* 2-COLUMN GRID (Centered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* FREE CARD */}
            <div className="p-10 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-2">Starter</h3>
              <div className="text-4xl font-black text-slate-900 mb-6">$0 <span className="text-sm font-medium text-slate-400">/mo</span></div>
              <p className="text-slate-500 text-sm mb-8">Perfect for testing the waters.</p>
              <ul className="space-y-4 mb-10 text-sm text-slate-600">
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-500" /> 3 Daily Research Credits</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-500" /> Basic Pipeline Board</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-500" /> Standard Support</li>
              </ul>
              <button onClick={onSignupClick} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all">
                Start Free
              </button>
            </div>

            {/* PRO CARD (Highlighted) */}
            <div className="p-10 rounded-3xl border-2 border-brand-500 bg-slate-900 text-white shadow-2xl shadow-brand-500/10 relative transform md:-translate-y-4">
               <div className="absolute top-0 right-0 p-4 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Most Popular</div>
               <h3 className="font-bold text-brand-400 uppercase text-xs tracking-widest mb-2">Pro Salesman</h3>
               <div className="text-4xl font-black mb-6">$49 <span className="text-sm font-medium text-slate-500">/mo</span></div>
               <p className="text-slate-400 text-sm mb-8">For closers who want unlimited power.</p>
               <ul className="space-y-4 mb-10 text-sm">
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-500" /> 100 Daily Research Credits</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-500" /> Deep Psychological Analysis</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-500" /> Priority Email Support</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-500" /> Unlimited Projects</li>
              </ul>
              <button onClick={onSignupClick} className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25">
                Go Unlimited
              </button>
            </div>
          </div>

          {/* ENTERPRISE CATCH-ALL */}
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm">
              Need API access or team seats? <a href="mailto:sales@sentientprospect.com" className="text-brand-600 font-bold hover:underline">Contact Sales</a>
            </p>
          </div>
        </div>
      </section>

      {/* 6. FOOTER - FINALLY VISIBLE AND SCROLLABLE! */}
      <Footer setCurrentView={setCurrentView} />

    </div>
  );
};

export default LandingPage;