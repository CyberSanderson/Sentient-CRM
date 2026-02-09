import React from 'react';
import { Scale, ArrowLeft } from 'lucide-react';

const TermsPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-white py-20 px-6 animate-fade-in">
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-12 font-bold text-sm uppercase tracking-widest">
        <ArrowLeft size={16} /> Back
      </button>
      <Scale className="text-blue-500 mb-6" size={40} />
      <h1 className="text-4xl font-black text-slate-900 mb-8">Terms of Service</h1>
      <div className="prose prose-slate text-slate-600 space-y-4">
        <p>By using Sentient Prospect, you agree to our fair-use policy regarding AI search credits.</p>
        <h3 className="font-bold text-slate-900">User Conduct</h3>
        <p>Users may not use automated tools to scrape Sentient Prospect. Credits are assigned per account and are non-transferable.</p>
      </div>
    </div>
  </div>
);

export default TermsPage;