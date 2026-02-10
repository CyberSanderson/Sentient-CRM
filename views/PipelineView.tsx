import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, DollarSign, ChevronDown } from 'lucide-react';
import { Lead, LeadStage } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import EditLeadModal from '../components/EditLeadModal'; 

interface PipelineViewProps {
  leads: Lead[];
}

const PipelineView: React.FC<PipelineViewProps> = ({ leads }) => {
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedLead = leads.find(l => l.id === draggableId);
    if (!movedLead) return;

    try {
      const leadRef = doc(db, 'leads', draggableId);
      await updateDoc(leadRef, {
        stage: destination.droppableId
      });
    } catch (error) {
      console.error("Error moving lead:", error);
    }
  };

  const getLeadsByStage = (stage: string) => leads.filter(l => l.stage === stage);
  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  const stages = [
    { id: LeadStage.NEW, title: 'New Leads', color: 'border-blue-500', bg: 'bg-blue-50' },
    { id: LeadStage.CONTACTED, title: 'Contacted', color: 'border-purple-500', bg: 'bg-purple-50' },
    { id: LeadStage.MEETING, title: 'Meeting', color: 'border-orange-500', bg: 'bg-orange-50' },
    { id: LeadStage.PROPOSAL, title: 'Proposal', color: 'border-indigo-500', bg: 'bg-indigo-50' },
    { id: LeadStage.CLOSED_WON, title: 'Won', color: 'border-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <>
      <div className="h-full flex flex-col animate-fade-in px-4 pt-4 md:px-0 md:pt-0">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
            <p className="text-slate-500">Manage your deal flow</p>
          </div>
          <div className="bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 w-full md:w-auto flex justify-between items-center">
            <span className="text-emerald-800 text-sm font-bold uppercase tracking-wider mr-2">Total Pipeline</span>
            <span className="text-emerald-700 text-xl font-black">${totalValue.toLocaleString()}</span>
          </div>
        </div>

        {/* 🟢 CONTAINER: flex-col on mobile (stack), flex-row on desktop (side-by-side) */}
        <div className="flex-1 md:overflow-x-auto pb-4 md:pb-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full min-w-0 md:min-w-max">
              {stages.map((stage) => {
                const stageLeads = getLeadsByStage(stage.id);
                const stageTotal = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
                
                return (
                  // 🟢 COLUMN: w-full on mobile, w-80 on desktop
                  <div key={stage.id} className="w-full md:w-80 flex flex-col flex-shrink-0">
                    
                    {/* Header */}
                    <div className={`bg-white p-4 rounded-t-xl border-t-4 shadow-sm z-10 ${stage.color} flex justify-between items-center cursor-pointer md:cursor-default`}>
                      <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-slate-800">{stage.title}</h3>
                           <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                             {stageLeads.length}
                           </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1">
                          ${stageTotal.toLocaleString()} Potential
                        </div>
                      </div>
                      {/* Mobile Hint Arrow */}
                      <ChevronDown className="text-slate-300 md:hidden" size={20} />
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          // 🟢 HEIGHT: Mobile adjusts to content, Desktop is full height
                          className={`flex-1 ${stage.bg} p-3 transition-colors border-x border-b border-slate-200 rounded-b-xl min-h-[100px] md:min-h-[calc(100vh-14rem)] md:overflow-y-auto custom-scrollbar ${
                            snapshot.isDraggingOver ? 'bg-slate-200/50 ring-2 ring-inset ring-brand-400' : ''
                          }`}
                        >
                          {stageLeads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setEditingLead(lead)} 
                                  className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 group hover:shadow-md hover:border-brand-300 transition-all cursor-pointer relative ${
                                    snapshot.isDragging ? 'shadow-2xl ring-2 ring-brand-500 rotate-2 z-50' : ''
                                  }`}
                                >
                                  {/* Drag Handle */}
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                                      
                                      {/* AI Badge */}
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

      <EditLeadModal 
        isOpen={!!editingLead} 
        onClose={() => setEditingLead(null)} 
        lead={editingLead} 
      />
    </>
  );
};

export default PipelineView;