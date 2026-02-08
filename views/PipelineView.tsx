import React from 'react';
import { Lead, LeadStage } from '../types';
import { STAGE_COLORS } from '../constants';
import { MoreHorizontal, DollarSign, Calendar } from 'lucide-react';

interface PipelineViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const PipelineView: React.FC<PipelineViewProps> = ({ leads, setLeads }) => {
  const columns = Object.values(LeadStage);
  const getLeadsByStage = (stage: LeadStage) => leads.filter(l => l.stage === stage);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Deal Pipeline</h1>
        <p className="text-slate-500 mt-1">Manage deal flow and track progress.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-4 h-full min-w-max px-0.5">
          {columns.map(stage => {
            const stageLeads = getLeadsByStage(stage);
            const colorClass = STAGE_COLORS[stage] || 'bg-gray-500 text-white';
            const dotColor = colorClass.split(' ')[0];
            
            return (
              <div key={stage} className="w-[85vw] sm:w-80 flex flex-col bg-slate-100 border border-slate-200 rounded-xl h-full max-h-full snap-center shrink-0">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-slate-100/90 backdrop-blur-sm rounded-t-xl z-10">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                    <h3 className="font-semibold text-slate-700 text-sm truncate">{stage}</h3>
                  </div>
                  <span className="bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md text-xs font-medium">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg mx-2">
                      <p className="text-slate-500 text-sm">No deals</p>
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <div key={lead.id} className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-200 rounded-lg p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer group relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-900 text-sm truncate pr-6">{lead.company}</h4>
                          <button className="text-slate-400 hover:text-slate-600 transition-opacity absolute top-3 right-3 p-1">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{lead.name}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex items-center text-slate-700 text-xs font-semibold">
                            <DollarSign size={12} className="mr-0.5 text-slate-400" />
                            {(lead.value || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-slate-200 bg-slate-100 rounded-b-xl text-xs text-slate-500 text-center">
                  Total: ${(stageLeads.reduce((s, l) => s + (l.value || 0), 0)).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelineView;