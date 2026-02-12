import React, { useState } from 'react';
import { 
  Bot, Check, Star, ArrowRight, Zap, Shield, BarChart3, 
  Globe, Menu, X, BrainCircuit, LayoutGrid, Search, UserCheck, MessageCircle 
} from 'lucide-react';
import { TRUSTED_COMPANIES } from '../constants';
import { View } from '../types';
import Footer from '../components/Footer';
import { HeroVisual } from '../components/landing/HeroVisual';

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

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    const container = document.getElementById('landing-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      id="landing-scroll-container"
      className="h-screen w-full bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white overflow-y-auto overflow-x-hidden scroll-smooth"
    >
      
      {/* 1. NAVIGATION */}
      <nav className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
              <img 
                src="/sentient-prospect-logo.png" 
                alt="Sentient Logo" 
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105" 
              />
              <span className="text-lg font-bold text-slate-900 tracking-tight">Sentient</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors">How it Works</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors">Pricing</a>
              <div className="flex items-center gap-3 ml-4 border-l border-slate-200 pl-6">
                <button onClick={onLoginClick} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Log in</button>
                <button onClick={onSignupClick} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5">Start Free</button>
              </div>
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4 shadow-xl absolute w-full z-50">
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
      <section className="pt-24 pb-20 px-4 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* ⭐ BADGE & STARS CONTAINER */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in-up">
            
            {/* 1. The "Live" Badge with Pulsing Dot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-200 text-brand-700 text-xs font-bold shadow-sm cursor-default">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
               </span>
               <span>Sentient AI Engine Live</span>
            </div>

            {/* 2. The 5 Stars Social Proof */}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-slate-600 text-xs font-medium border-l border-slate-200 pl-2 ml-1">Rated 4.9/5 by 500+ Sales Teams</span>
            </div>
            
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tighter mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Stop Selling to Strangers. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600">Know Everything First.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up delay-200">
            Enter a prospect's name. In 10 seconds, our AI builds a <b>psychological dossier</b>, finds their pain points, and writes the perfect ice-breaker.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button onClick={onSignupClick} className="w-full sm:w-auto h-14 px-8 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-brand-500/20 hover:-translate-y-1">
              Build a Free Dossier <ArrowRight size={20} />
            </button>
            <button onClick={onDemoClick} className="w-full sm:w-auto h-14 px-8 bg-white backdrop-blur-sm text-slate-900 text-lg font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all hover:border-slate-300 hover:shadow-lg">
              View Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY */}
      <div className="border-t border-slate-100 bg-white py-12 relative z-10">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Powering research for</p>
        <div className="flex justify-center items-center gap-12 md:gap-20 flex-wrap px-4 opacity-40 grayscale">
          {TRUSTED_COMPANIES.map((company, i) => (
            <span key={i} className="text-xl md:text-2xl font-bold text-slate-500 tracking-tighter">{company}</span>
          ))}
        </div>
      </div>

      {/* 4. THE VISUAL WORKFLOW */}
      <section className="relative w-full border-y border-slate-200 bg-slate-50/50 overflow-hidden py-10 md:py-0">
         <div className="max-w-7xl mx-auto relative h-[500px] flex items-center justify-center">
            {/* LABEL */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 bg-white/80 backdrop-blur border border-slate-200 px-4 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                How It Works
            </div>
            
            {/* THE NEW "LITERAL" COMPONENT */}
            <div className="w-full h-full scale-[0.7] md:scale-100 origin-center">
                <HeroVisual />
            </div>
         </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="features" className="py-32 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">The "Unfair Advantage"</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Most reps spend 30 minutes researching one lead. You do it in 10 seconds.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Psychological Profiling</h3>
              <p className="text-slate-500 leading-relaxed">
                Is your prospect a Driver, a Visionary, or a Skeptic? Our AI analyzes their digital footprint to tell you exactly <b>how to pitch them.</b>
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The "Ice-Breaker" Engine</h3>
              <p className="text-slate-500 leading-relaxed">
                Never write "Just checking in" again. We generate hyper-specific openers based on their recent news, posts, and company filings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                <UserCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Deep Dive Dossiers</h3>
              <p className="text-slate-500 leading-relaxed">
                Get a one-page cheat sheet on every prospect before the meeting. Know their background, their pains, and their goals instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Return on Investment? Instant.</h2>
            <p className="text-xl text-slate-500">One closed deal pays for this software for a lifetime.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* FREE CARD */}
            <div className="p-10 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col">
              <div className="mb-8">
                <h3 className="font-bold text-slate-900 text-2xl mb-2">Researcher</h3>
                <div className="flex items-baseline gap-1">
                    <div className="text-4xl font-bold text-slate-900">$0</div>
                    <span className="text-slate-500 font-medium">/mo</span>
                </div>
                <p className="text-slate-500 mt-4">For testing the capabilities.</p>
              </div>
              
              <ul className="space-y-4 mb-10 text-slate-600 flex-1">
                <li className="flex items-center gap-3"><div className="bg-slate-100 p-1 rounded-full"><Check size={14} /></div> 3 Deep-Dive Dossiers / Day</li>
                <li className="flex items-center gap-3"><div className="bg-slate-100 p-1 rounded-full"><Check size={14} /></div> Basic Personality Scoring</li>
                <li className="flex items-center gap-3"><div className="bg-slate-100 p-1 rounded-full"><Check size={14} /></div> Standard Email Drafts</li>
              </ul>
              
              <button onClick={onSignupClick} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all">
                Start Free
              </button>
            </div>

            {/* PRO CARD */}
            <div className="relative p-10 rounded-3xl border-2 border-brand-500 bg-white shadow-xl shadow-brand-500/5 flex flex-col">
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl tracking-wide uppercase">
                Best Value
              </div>
              
              <div className="mb-8">
                <h3 className="font-bold text-brand-700 text-2xl mb-2">Closer</h3>
                <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-slate-900">$29</div>
                    <span className="text-slate-500 font-medium">/mo</span>
                    <span className="text-lg text-slate-400 line-through decoration-slate-400">$49</span>
                </div>
                <p className="text-slate-500 mt-4">For high-volume outreach.</p>
              </div>

              <ul className="space-y-4 mb-10 text-slate-700 flex-1">
                <li className="flex items-center gap-3"><div className="bg-brand-100 text-brand-600 p-1 rounded-full"><Check size={14} /></div> <b>100</b> Deep-Dive Dossiers / Day</li>
                <li className="flex items-center gap-3"><div className="bg-brand-100 text-brand-600 p-1 rounded-full"><Check size={14} /></div> Advanced Psychological Profiling</li>
                <li className="flex items-center gap-3"><div className="bg-brand-100 text-brand-600 p-1 rounded-full"><Check size={14} /></div> "Buying Signal" Alerts</li>
                <li className="flex items-center gap-3"><div className="bg-brand-100 text-brand-600 p-1 rounded-full"><Check size={14} /></div> Priority Support</li>
              </ul>

              <button 
                onClick={() => window.location.href = 'https://buy.stripe.com/28E9ASepHf7bdrEbX6dAk01'} 
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30"
              >
                Claim Founder's Rate
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer setCurrentView={setCurrentView} />

    </div>
  );
};

export default LandingPage;