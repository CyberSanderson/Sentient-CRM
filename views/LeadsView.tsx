import React, { useState } from 'react';
import { Lead, LeadStage } from '../types';
import { STAGE_COLORS } from '../constants';
import { Search, Filter, BrainCircuit, Mail, Plus, PenSquare, Star, ChevronDown, ChevronRight } from 'lucide-react';
import AIModal from '../components/AIModal';
import { generateLeadInsight, generateColdEmail, scoreLeadAI } from '../services/geminiService';

interface LeadsViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads, setLeads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalConfig, setModalConfig] = useState<{ open: boolean; title: string; content: string; loading: boolean }>({
    open: false, title: '', content: '', loading: false
  });

  // Filter leads
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeModal = () => setModalConfig(prev => ({ ...prev, open: false }));

  const handleAIAction = async (action: 'analyze' | 'email' | 'score', lead: Lead) => {
    setModalConfig({ open: true, title: 'Processing...', content: '', loading: true });
    
    let result = '';
    let title = '';

    if (action === 'analyze') {
      title = `AI Analysis: ${lead.company}`;
      result = await generateLeadInsight(lead);
    } else if (action === 'email') {
      title = `Draft Email to ${lead.name}`;
      result = await generateColdEmail(lead);
    } else if (action === 'score') {
      title = `Scoring ${lead.company}...`;
      const scoreData = await scoreLeadAI(lead);
      
      // Update local state with new score
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, aiScore: scoreData.score } : l));
      
      result = `**Score:** ${scoreData.score}/100\n\n**Reasoning:**\n${scoreData.reason}`;
    }

    setModalConfig({ open: true, title, content: result, loading: false });
  };

  // Helper for Desktop Table Action Buttons
  const ActionButtons = ({ lead }: { lead: Lead }) => (
    <div className="flex items-center gap-1">
      <button 
        onClick={() => handleAIAction('analyze', lead)}
        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors" 
        title="AI Analysis"
      >
        <BrainCircuit size={18} />
      </button>
      <button 
        onClick={() => handleAIAction('email', lead)}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
        title="Draft Email"
      >
        <Mail size={18} />
      </button>
      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md" title="Edit">
        <PenSquare size={18} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leads Database</h1>
          <p className="text-slate-500 mt-1">Centralized repository of all potential clients.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20 w-full sm:w-auto justify-center">
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-xl sticky top-0 sm:static z-10 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 transition-colors">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Name / Company</th>
                <th className="p-4 font-medium">Stage</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium text-center">AI Score</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{lead.name}</span>
                      <span className="text-sm text-slate-500">{lead.company}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STAGE_COLORS[lead.stage]}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">
                    ${lead.value.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    {lead.aiScore ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className={`text-sm font-bold ${
                          lead.aiScore >= 80 ? 'text-emerald-600' : 
                          lead.aiScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {lead.aiScore}
                        </span>
                        <Star size={12} className={lead.aiScore >= 80 ? 'fill-emerald-500 text-emerald-500' : 'text-slate-400'} />
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAIAction('score', lead)}
                        className="text-xs text-brand-600 hover:text-brand-500 hover:underline"
                      >
                        Calculate
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ActionButtons lead={lead} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Hidden on Desktop) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-slate-900 font-semibold text-lg">{lead.name}</h3>
                <p className="text-slate-500 text-sm">{lead.company}</p>
              </div>
              <div className="text-right">
                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STAGE_COLORS[lead.stage]}`}>
                  {lead.stage.split(' ')[0]}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase">Value</span>
                <span className="text-slate-900 font-medium">${lead.value.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-xs text-slate-500 uppercase">AI Score</span>
                 {lead.aiScore ? (
                    <span className={`font-bold ${
                      lead.aiScore >= 80 ? 'text-emerald-600' : 
                      lead.aiScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {lead.aiScore}/100
                    </span>
                 ) : (
                   <button onClick={() => handleAIAction('score', lead)} className="text-brand-600 text-xs">Calculate</button>
                 )}
              </div>
            </div>

            {/* Mobile Actions (Always Visible) */}
            <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
               <button 
                onClick={() => handleAIAction('analyze', lead)}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg text-slate-600 text-sm font-medium active:scale-95 transition-transform"
              >
                <BrainCircuit size={16} />
                Analyze
              </button>
              <button 
                onClick={() => handleAIAction('email', lead)}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg text-slate-600 text-sm font-medium active:scale-95 transition-transform"
              >
                <Mail size={16} />
                Draft
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          No leads found matching your search.
        </div>
      )}

      <AIModal 
        isOpen={modalConfig.open} 
        onClose={closeModal} 
        title={modalConfig.title} 
        content={modalConfig.content} 
        isLoading={modalConfig.loading} 
      />
    </div>
  );
};

export default LeadsView;