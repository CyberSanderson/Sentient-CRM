import React, { useState } from 'react';
import { Lead, LeadStage } from '../types';
import { STAGE_COLORS } from '../constants';
import { MoreHorizontal, DollarSign, Calendar, GripVertical } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PipelineViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const PipelineView: React.FC<PipelineViewProps> = ({ leads, setLeads }) => {
  const columns = Object.values(LeadStage);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- DRAG HANDLERS ---
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    setIsDragging(true);
    // Required for Firefox
    e.dataTransfer.effectAllowed = "move";
    // Make the ghost image transparent
    e.dataTransfer.setData("text/plain", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedLeadId) return;

    // 1. Optimistic Update (Update UI immediately so it feels fast)
    const updatedLeads = leads.map(lead => {
      if (lead.id === draggedLeadId) {
        return { ...lead, stage: targetStage };
      }
      return lead;
    });
    setLeads(updatedLeads); // Update local state
    setDraggedLeadId(null);

    // 2. Persist to Firebase
    try {
      const leadRef = doc(db, "leads", draggedLeadId);
      await updateDoc(leadRef, { 
        stage: targetStage,
        status: targetStage // Keep status synced
      });
      console.log(`Moved lead ${draggedLeadId} to ${targetStage}`);
    } catch (error) {
      console.error("Error updating drag:", error);
      // Optional: Revert state if failed (omitted for simplicity)
    }
  };

  const getLeadsByStage = (stage: LeadStage) => leads.filter(l => l.stage === stage);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Deal Pipeline</h1>
        <p className="text-slate-500 mt-1">Drag and drop cards to move them through the pipeline.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-4 h-full min-w-max px-0.5">
          {columns.map(stage => {
            const stageLeads = getLeadsByStage(stage);
            const colorClass = STAGE_COLORS[stage] || 'bg-gray-500 text-white';
            const dotColor = colorClass.split(' ')[0];
            
            return (
              <div 
                key={stage} 
                className={`w-[85vw] sm:w-80 flex flex-col bg-slate-100 border border-slate-200 rounded-xl h-full max-h-full snap-center shrink-0 transition-colors ${
                  isDragging ? 'hover:bg-slate-200/50 hover:border-brand-300' : ''
                }`}
                // 🟢 DROP ZONES
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-slate-100/90 backdrop-blur-sm rounded-t-xl z-10">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                    <h3 className="font-semibold text-slate-700 text-sm truncate">{stage}</h3>
                  </div>
                  <span className="bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md text-xs font-medium">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[100px]">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg mx-2 opacity-50 pointer-events-none">
                      <p className="text-slate-500 text-sm">Drop here</p>
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <div 
                        key={lead.id} 
                        // 🟢 DRAGGABLE CARD
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group relative transition-all ${
                          draggedLeadId === lead.id ? 'opacity-50 rotate-3 scale-95' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-900 text-sm truncate pr-6">{lead.company}</h4>
                          <GripVertical size={16} className="text-slate-300 absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{lead.name}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                           {lead.aiScore && (
                             <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                               lead.aiScore > 75 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                             }`}>
                               AI: {lead.aiScore}
                             </span>
                           )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex items-center text-slate-700 text-xs font-semibold">
                            <DollarSign size={12} className="mr-0.5 text-slate-400" />
                            {(lead.value || 0).toLocaleString()}
                          </div>
                          <div className="flex items-center text-slate-400 text-[10px]">
                            <Calendar size={12} className="mr-1" />
                            {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Footer Summary */}
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