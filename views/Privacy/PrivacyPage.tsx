import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const PrivacyPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-white py-20 px-6 animate-fade-in">
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-12 font-bold text-sm uppercase tracking-widest">
        <ArrowLeft size={16} /> Back
      </button>
      <ShieldCheck className="text-emerald-500 mb-6" size={40} />
      <h1 className="text-4xl font-black text-slate-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-slate text-slate-600 space-y-4">
        <p>At Sentient Prospect, we collect minimal data to provide our AI services. This includes your email via Clerk and metadata for search queries.</p>
        <h3 className="font-bold text-slate-900">Data Usage</h3>
        <p>We do not sell your data. Queries are processed via Google Gemini and lead data is stored securely in Firebase.</p>
      </div>
    </div>
  </div>
);

export default PrivacyPage;