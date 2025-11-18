import React from 'react';
import { Bot, Check, Star, ArrowRight, Zap, Shield, BarChart3, Globe, Menu, X, Cpu, LayoutGrid } from 'lucide-react';
import { APP_NAME, TESTIMONIALS, PRICING_TIERS, TRUSTED_COMPANIES, INTEGRATIONS } from '../constants';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onDemoClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick, onDemoClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={scrollToTop}
            >
              <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-1.5 rounded-lg shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105">
                <Bot className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                {APP_NAME}
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
              <a href="#integrations" onClick={(e) => scrollToSection(e, 'integrations')} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Integrations</a>
              <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Testimonials</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Pricing</a>
              <div className="flex items-center gap-4 ml-4 border-l border-slate-200 pl-8">
                <button onClick={onLoginClick} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                  Log in
                </button>
                <button 
                  onClick={onSignupClick}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-brand-500/25 hover:scale-105"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4 animate-fade-in shadow-xl">
             <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="block text-base font-medium text-slate-700">Features</a>
             <a href="#integrations" onClick={(e) => scrollToSection(e, 'integrations')} className="block text-base font-medium text-slate-700">Integrations</a>
             <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="block text-base font-medium text-slate-700">Testimonials</a>
             <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="block text-base font-medium text-slate-700">Pricing</a>
             <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <button onClick={onLoginClick} className="w-full py-3 bg-slate-100 text-slate-900 rounded-lg font-medium">Log In</button>
                <button onClick={onSignupClick} className="w-full py-3 bg-brand-600 text-white rounded-lg font-medium shadow-brand-500/20 shadow-lg">Sign Up</button>
             </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
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

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
            Close Deals Faster with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600">Sentient Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Stop guessing. Start closing. Sentient CRM uses advanced AI to score leads, draft personalized emails, and predict pipeline health in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button 
              onClick={onSignupClick}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-all hover:shadow-xl flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={onDemoClick}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 text-lg font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all hover:shadow-md group"
            >
              View Live Demo
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
            </button>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap justify-center gap-x-8 gap-y-4 text-slate-500 text-sm font-medium animate-fade-in-up delay-500">
            <span className="flex items-center gap-2"><Shield size={16} /> SOC2 Compliant</span>
            <span className="flex items-center gap-2"><Globe size={16} /> Works Globally</span>
            <span className="flex items-center gap-2"><Zap size={16} /> Real-time Sync</span>
          </div>
        </div>
      </section>

      {/* Trusted By Strip */}
      <div className="border-y border-slate-100 bg-slate-50/50 py-10 overflow-hidden">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by revenue teams at</p>
        <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap px-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {TRUSTED_COMPANIES.map((company, i) => (
            <span key={i} className="text-xl md:text-2xl font-bold text-slate-400 hover:text-slate-600 transition-colors">{company}</span>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Superpowers for Sales Teams</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Built for modern sales motions. Powered by next-gen large language models.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Predictive Scoring</h3>
              <p className="text-slate-500 leading-relaxed">
                Stop wasting time on dead leads. Our AI analyzes thousands of data points to score every prospect on likelihood to close.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:shadow-lg transition-all group">
               <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Auto-Drafting</h3>
              <p className="text-slate-500 leading-relaxed">
                Generate hyper-personalized cold outreach and follow-ups in seconds. The AI learns your voice and improves over time.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:shadow-lg transition-all group">
               <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Insights</h3>
              <p className="text-slate-500 leading-relaxed">
                Get a daily briefing of your pipeline health, risks, and opportunities. It's like having a 24/7 sales analyst.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Connects with your entire stack</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Sentient CRM isn't another silo. It sits at the center of your workflow, pulling signals from email, chat, and calendars to build a complete picture of every deal.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <Cpu size={20} className="text-brand-500" />
                    <span>Bi-directional Sync</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <LayoutGrid size={20} className="text-brand-500" />
                    <span>Custom API Webhooks</span>
                  </div>
                </div>
                <button className="text-brand-600 font-semibold flex items-center gap-2 hover:text-brand-700 mt-4 transition-colors">
                  View all 50+ integrations <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                {INTEGRATIONS.map((tool, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-4 text-slate-700">
                      <tool.icon size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{tool.name}</h4>
                    <p className="text-xs text-slate-500">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Loved by Top Performers</h2>
            <div className="flex justify-center items-center gap-2 text-amber-400 mb-4">
               <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-amber-400" />)}
               </div>
               <span className="text-slate-900 font-bold text-lg ml-2">4.9</span>
               <span className="text-slate-500 text-sm">(2,400+ reviews)</span>
            </div>
            <p className="text-slate-500">Join thousands of sales professionals crushing their quotas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < t.stars ? "fill-amber-400 text-amber-400" : "fill-slate-300 text-slate-300"} 
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-500">Choose the plan that fits your growth stage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div 
                key={tier.name} 
                className={`relative p-8 rounded-2xl border flex flex-col transition-all ${
                  tier.recommended 
                    ? 'bg-white border-brand-500 shadow-2xl shadow-brand-900/5 z-10 scale-105' 
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  {tier.period && <span className="text-slate-500">{tier.period}</span>}
                </div>
                <p className="text-slate-500 text-sm mb-8 border-b border-slate-100 pb-6">{tier.description}</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check size={16} className="text-brand-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onSignupClick}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${
                    tier.recommended 
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1.5 rounded-lg">
              <Bot className="text-slate-500" size={20} />
            </div>
            <span className="font-bold text-slate-700">{APP_NAME}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
          </div>
          <div className="text-sm text-slate-400">
            © 2024 Sentient CRM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;