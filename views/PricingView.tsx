import React from 'react';
import { Check, Zap, Crown, ArrowRight, Star, Shield } from 'lucide-react';

const PricingView = () => {
  // 🟢 FIXED: Your actual $29 Founder's Rate Link
  const STRIPE_PRO_LINK = "https://buy.stripe.com/28E9ASepHf7bdrEbX6dAk01";

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-brand-600 font-bold uppercase tracking-widest text-sm mb-3">Pricing Plans</h2>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Ready to scale your outreach?</h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
          Stop hitting daily limits. Get the deep intelligence and live search data you need to close high-ticket deals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group opacity-60 hover:opacity-100 transition-opacity">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
            <p className="text-slate-500 text-sm">Perfect for testing the waters.</p>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-8">$0 <span className="text-lg font-medium text-slate-400">/mo</span></div>
          
          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-300" /> 3 Daily Research Credits
            </li>
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-300" /> Basic Pipeline Access
            </li>
            <li className="flex items-center gap-3 text-slate-600 text-sm">
              <Check size={18} className="text-slate-300" /> Standard Support
            </li>
          </ul>

          <button disabled className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl cursor-not-allowed">
            Your Current Plan
          </button>
        </div>

        {/* Pro Plan - FOUNDER'S RATE EDITION */}
        <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl shadow-brand-500/20 border-2 border-brand-500 relative transform hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-6 right-8 text-brand-400">
            <Crown size={32} />
          </div>
          
          <div className="mb-6">
            <div className="bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
              Limited Time Offer
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro Salesman</h3>
            <p className="text-slate-400 text-sm">For serious dealmakers and founders.</p>
          </div>

          {/* 💰 UPDATED PRICING DISPLAY */}
          <div className="flex items-baseline mb-8">
            <span className="text-5xl font-black text-white">$29</span>
            <span className="text-lg font-medium text-slate-500 ml-2">/mo</span>
            {/* Strikethrough Old Price */}
            <span className="text-xl text-slate-600 line-through ml-4 decoration-red-500/50">$49</span>
          </div>
          
          <ul className="space-y-5 mb-12">
            <li className="flex items-center gap-3 text-slate-200 font-medium">
              <Zap size={20} className="text-yellow-400 fill-yellow-400" /> 
              <span><b>100</b> Daily Search Credits</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200 font-medium">
              <Star size={20} className="text-brand-400 fill-brand-400" /> 
              <span><b>Live Google Search</b> Integration</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200 font-medium">
              <Check size={20} className="text-brand-500" /> 
              <span>Unlimited Lead Storage</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200 font-medium">
              <Shield size={20} className="text-brand-500" /> 
              <span>Deep Psychological Analysis</span>
            </li>
          </ul>

          <a 
            href={STRIPE_PRO_LINK}
            className="w-full py-5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl shadow-xl shadow-brand-500/40 transition-all flex items-center justify-center gap-3 group"
          >
            Claim Founder's Rate <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-center text-slate-500 text-xs mt-4">Secure payment via Stripe. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingView;