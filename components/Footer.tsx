import React from 'react';
import { Bot } from 'lucide-react';
import { View } from '../types';

interface FooterProps {
  setCurrentView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  return (
    <footer className="py-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1.5 rounded-lg">
            <Bot className="text-slate-500" size={20} />
          </div>
          <span className="font-bold text-slate-700 uppercase tracking-tighter">Sentient Prospect</span>
        </div>
        
        <div className="flex gap-6 text-sm text-slate-500">
          {/* ✅ FIXED: Lowercase strings to match your App.tsx routes */}
          <button 
            onClick={() => { window.scrollTo(0,0); setCurrentView('privacy'); }} 
            className="hover:text-slate-900 transition-colors font-medium"
          >
            Privacy
          </button>
          <button 
            onClick={() => { window.scrollTo(0,0); setCurrentView('terms'); }} 
            className="hover:text-slate-900 transition-colors font-medium"
          >
            Terms
          </button>
          <button 
            onClick={() => { window.scrollTo(0,0); setCurrentView('refunds'); }} 
            className="hover:text-slate-900 transition-colors font-medium"
          >
            Refunds
          </button>
        </div>
        
        <div className="text-sm text-slate-400">
          © 2026 Sentient Prospect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;