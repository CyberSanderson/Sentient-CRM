import React from 'react';
import { RefreshCcw, ArrowLeft } from 'lucide-react';

const RefundsPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-white py-20 px-6 animate-fade-in">
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-12 font-bold text-sm uppercase tracking-widest">
        <ArrowLeft size={16} /> Back
      </button>
      <RefreshCcw className="text-orange-500 mb-6" size={40} />
      <h1 className="text-4xl font-black text-slate-900 mb-8">Refund Policy</h1>
      <div className="prose prose-slate text-slate-600 space-y-4">
        <p>Sentient Prospect provides digital, instantly consumable AI search credits.</p>
        <h3 className="font-bold text-slate-900">Cancellation</h3>
        <p>Subscriptions can be cancelled at any time via the Stripe billing portal. Refunds are generally not provided for credits already consumed.</p>
      </div>
    </div>
  </div>
);

export default RefundsPage;