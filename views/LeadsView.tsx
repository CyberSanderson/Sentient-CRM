import React, { useState } from 'react';
import { Search, BrainCircuit, Trash2, ChevronDown } from 'lucide-react';
import { Lead } from '../types';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LeadsViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter leads based on search
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this prospect?')) {
      try {
        await deleteDoc(doc(db, 'leads', id));
      } catch (error) {
        console.error("Error deleting lead:", error);
        alert("Failed to delete.");
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Prospects</h1>
          <p className="text-slate-500 mt-2">Manage your saved research and generated strategies.</p>
        </div>
        
        {/* Helper Badge */}
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
          To add a new lead, use the <strong>Research</strong> tab.
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search prospects or companies..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List View */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="opacity-40" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No prospects found</h3>
            <p>Go to the <strong>Research</strong> tab to analyze and save your first lead.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="group transition-colors hover:bg-slate-50">
                {/* Main Row */}
                <div 
                  className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                  onClick={() => toggleExpand(lead.id.toString())}
                >
                  {/* Avatar/Initials */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                    {lead.name.charAt(0)}
                  </div>

                  {/* Name & Role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{lead.name}</h3>
                      {lead.dossier && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1">
                          <BrainCircuit size={12} /> AI Ready
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                      <span className="font-medium text-slate-700">{lead.role}</span>
                      <span className="text-slate-300">•</span>
                      <span>{lead.company}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDelete(e, lead.id.toString())}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Prospect"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Detail View */}
                {expandedId === lead.id && lead.dossier && (
                  <div className="px-6 pb-6 md:pl-20 md:pr-6 animate-fade-in">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Psychological Profile</h4>
                        <p className="text-slate-700 text-sm leading-relaxed">{lead.dossier.personality}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-100">
                          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Ice Breakers</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {lead.dossier.iceBreakers.map((ib: string, i: number) => (
                              <li key={i} className="text-slate-600 text-xs">{ib}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-100">
                          <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Pain Points</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {lead.dossier.painPoints.map((pp: string, i: number) => (
                              <li key={i} className="text-slate-600 text-xs">{pp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Draft</h4>
                           <button 
                            onClick={() => navigator.clipboard.writeText(lead.dossier.emailDraft)}
                            className="text-xs text-brand-600 hover:underline"
                           >
                             Copy
                           </button>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-600 whitespace-pre-wrap">
                          {lead.dossier.emailDraft}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsView;