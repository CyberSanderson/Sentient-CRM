import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MoreHorizontal, GripVertical, AlertCircle, DollarSign } from 'lucide-react';
import { Lead, LeadStage } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import EditLeadModal from '../components/EditLeadModal'; // 👈 Import the new modal

interface PipelineViewProps {
  leads: Lead[];
}

const PipelineView: React.FC<PipelineViewProps> = ({ leads }) => {
  const [editingLead, setEditingLead] = useState<Lead | null>(null); // 👈 State for modal

  // --- Drag & Drop Logic (Same as before) ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedLead = leads.find(l => l.id === draggableId);
    if (!movedLead) return;

    // Optimistic Update (Visual) happens via parent prop updates usually, 
    // but here we just fire the database update.
    try {
      const leadRef = doc(db, 'leads', draggableId);
      await updateDoc(leadRef, {
        stage: destination.droppableId
      });
    } catch (error) {
      console.error("Error moving lead:", error);
      alert("Failed to move lead");
    }
  };

  // Helper to filter leads by column
  const getLeadsByStage = (stage: string) => leads.filter(l => l.stage === stage);

  // Calculate Total Pipeline Value
  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  const stages = [
    { id: LeadStage.NEW, title: 'New Leads', color: 'border-blue-500' },
    { id: LeadStage.CONTACTED, title: 'Contacted', color: 'border-purple-500' },
    { id: LeadStage.MEETING, title: 'Meeting', color: 'border-orange-500' },
    { id: LeadStage.PROPOSAL, title: 'Proposal', color: 'border-indigo-500' },
    { id: LeadStage.CLOSED, title: 'Won', color: 'border-emerald-500' },
  ];

  return (
    <>
      <div className="h-full flex flex-col animate-fade-in">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
            <p className="text-slate-500">Drag and drop to manage deal flow</p>
          </div>
          <div className="bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 text-sm font-bold uppercase tracking-wider mr-2">Total Pipeline</span>
            <span className="text-emerald-700 text-xl font-black">${totalValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 min-w-max h-full">
              {stages.map((stage) => {
                const stageLeads = getLeadsByStage(stage.id);
                const stageTotal = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
                
                return (
                  <div key={stage.id} className="w-80 flex flex-col h-full max-h-[calc(100vh-12rem)]">
                    {/* Column Header */}
                    <div className={`bg-white p-4 rounded-t-xl border-t-4 shadow-sm flex-shrink-0 z-10 ${stage.color}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-800">{stage.title}</h3>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        ${stageTotal.toLocaleString()} Potential
                      </div>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 bg-slate-100/50 p-3 overflow-y-auto custom-scrollbar border-x border-b border-slate-200 rounded-b-xl transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50/80 border-blue-200' : ''
                          }`}
                        >
                          {stageLeads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setEditingLead(lead)} // 👈 OPEN MODAL ON CLICK
                                  className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 group hover:shadow-md hover:border-brand-300 transition-all cursor-pointer relative ${
                                    snapshot.isDragging ? 'shadow-xl ring-2 ring-brand-500 rotate-2' : ''
                                  }`}
                                >
                                  {/* Drag Handle Icon (Visible on Hover) */}
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical size={16} />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        {lead.company}
                                      </span>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-bold text-slate-900 leading-tight">{lead.name}</h4>
                                      <p className="text-xs text-slate-500 mt-0.5">{lead.role}</p>
                                    </div>

                                    {/* Value Badge */}
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                                        lead.value > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                      }`}>
                                        <DollarSign size={12} />
                                        {lead.value > 0 ? lead.value.toLocaleString() : '0'}
                                      </div>
                                      
                                      {/* AI Insight Badge (If dossier exists) */}
                                      {lead.dossier && (
                                        <div className="ml-auto flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                          AI Ready
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* 🟢 RENDER THE MODAL HERE */}
      <EditLeadModal 
        isOpen={!!editingLead} 
        onClose={() => setEditingLead(null)} 
        lead={editingLead} 

        // testing.
      />
    </>
  );
};

export default PipelineView;