import React from 'react';
import { Check, Zap, Crown, ArrowRight, Star, Shield, Users, Briefcase } from 'lucide-react';

const PricingView = () => {
  // 🟢 UPDATED: Your new Stripe Links
  const STRIPE_PRO_LINK = "https://buy.stripe.com/bJeaEW6Xf2kp5Zc3qAdAk03";
  const STRIPE_TEAM_LINK = "https://buy.stripe.com/00waEW2GZ9MR9bo4uEdAk02";

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-brand-600 font-bold uppercase tracking-widest text-sm mb-3">Upgrade Your Arsenal</h2>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Ready to dominate your market?</h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
          Stop hitting daily limits. Get the deep intelligence and live search data you need to close high-ticket deals.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
        
        {/* 1. Free Plan (Current) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Researcher</h3>
            <p className="text-slate-500 text-sm">Your current plan.</p>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-6">$0 <span className="text-lg font-medium text-slate-400">/mo</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-300" /> 3 Daily Research Credits
            </li>
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-300" /> Basic Personality Scoring
            </li>
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-300" /> Standard Support
            </li>
          </ul>

          <button disabled className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl cursor-not-allowed border border-slate-200">
            Active
          </button>
        </div>

        {/* 2. Pro Plan ($97) - THE HIGHLIGHT */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-brand-500/20 border-2 border-brand-500 relative transform md:-translate-y-4 hover:scale-[1.02] transition-all duration-300 z-10">
          <div className="absolute top-0 inset-x-0 -mt-3 flex justify-center">
            <div className="bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase shadow-sm">
              Most Popular
            </div>
          </div>
          
          <div className="mb-6 mt-4">
            <h3 className="text-2xl font-bold text-white mb-2">Pro Agent</h3>
            <p className="text-slate-400 text-sm">For brokers dominating their market.</p>
          </div>

          <div className="flex items-baseline mb-6">
            <span className="text-5xl font-black text-white">$97</span>
            <span className="text-lg font-medium text-slate-500 ml-2">/mo</span>
          </div>
          
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-white font-bold">
              <Zap size={20} className="text-brand-400 fill-brand-400" /> 
              <span>Unlimited Access</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300 font-medium">
              <Check size={20} className="text-brand-500" /> 
              <span>Deep Psychological Analysis</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300 font-medium">
              <Check size={20} className="text-brand-500" /> 
              <span>Export to PDF & Email</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300 font-medium">
              <Check size={20} className="text-brand-500" /> 
              <span>Priority Support</span>
            </li>
          </ul>

          <a 
            href={STRIPE_PRO_LINK}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl shadow-xl shadow-brand-500/40 transition-all flex items-center justify-center gap-3 group"
          >
            Upgrade Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-center text-slate-600 text-xs mt-4">Secure payment via Stripe.</p>
        </div>

        {/* 3. Team Plan ($297) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-slate-300 transition-colors">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Team</h3>
            <p className="text-slate-500 text-sm">For Senior Brokers & Associates.</p>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-6">$297 <span className="text-lg font-medium text-slate-400">/mo</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-700 font-bold">
              <Users size={18} className="text-slate-400" /> 3 User Seats Included
            </li>
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-400" /> Shared Team Dossiers
            </li>
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-400" /> Collaborative Workspace
            </li>
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-400" /> Dedicated Account Manager
            </li>
          </ul>

          <a 
            href={STRIPE_TEAM_LINK}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl transition-all flex items-center justify-center"
          >
            Get Team Access
          </a>
        </div>

      </div>
    </div>
  );
};

export default PricingView;