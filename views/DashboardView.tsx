import React, { useState } from 'react';
import { Search, Sparkles, User, Building2, Briefcase, Send, Loader2, BrainCircuit, MessageSquare } from 'lucide-react';
import { Lead } from '../types';

// Define the shape of our AI response
interface Dossier {
  personality: string;
  painPoints: string[];
  iceBreakers: string[];
  emailDraft: string;
}

interface DashboardViewProps {
  leads: Lead[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads }) => {
  // Input State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  
  // AI State
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Dossier | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDossier(null);

    try {
      // Call our new Backend API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectName: name, company, role }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setDossier(data);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze. Make sure your API keys are set!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Research Center</h1>
        <p className="text-slate-500 mt-2">Stop guessing. Generate a psychological dossier on any prospect in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Input Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search size={20} className="text-brand-500" />
              Target Profile
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prospect Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. Elon Musk"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. Tesla"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. CEO"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'Analyzing...' : 'Generate Dossier'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: The Results */}
        <div className="lg:col-span-2">
          {!dossier && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 min-h-[400px]">
              <BrainCircuit size={64} className="mb-4 opacity-20" />
              <p>Enter a prospect details to generate insights</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 rounded-2xl border border-slate-200 min-h-[400px] animate-pulse">
              <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
              <p className="font-medium">Consulting the AI oracle...</p>
              <p className="text-sm opacity-70">Analyzing psychological drivers...</p>
            </div>
          )}

          {dossier && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Personality Card */}
              <div className="bg-white p-6 rounded-2xl border-l-4 border-purple-500 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <BrainCircuit className="text-purple-500" size={24} />
                  Psychological Profile
                </h3>
                <p className="text-slate-600 leading-relaxed">{dossier.personality}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pain Points */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-red-600 mb-4">Likely Pain Points</h3>
                  <ul className="space-y-3">
                    {dossier.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ice Breakers */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-emerald-600 mb-4">Ice Breakers</h3>
                  <ul className="space-y-3">
                    {dossier.iceBreakers.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Email Draft */}
              <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Send className="text-brand-400" size={20} />
                    Generated Draft
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(dossier.emailDraft)}
                    className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {dossier.emailDraft}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;