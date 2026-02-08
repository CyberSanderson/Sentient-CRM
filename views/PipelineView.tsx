import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, DollarSign, Pencil } from 'lucide-react'; // 👈 Added Pencil
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
            <p className="text-slate-500">Drag handle to move • Click pencil to edit</p>
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
                    <div className={`bg-white p-4 rounded-t-xl border-t-4 shadow-sm flex-shrink-0 z-10 ${stage.color}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-800">{stage.title}</h3>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">{stageLeads.length}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">${stageTotal.toLocaleString()} Potential</div>
                    </div>

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
                                  className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 group hover:shadow-md hover:border-brand-300 transition-all relative ${
                                    snapshot.isDragging ? 'shadow-xl ring-2 ring-brand-500 rotate-2' : ''
                                  }`}
                                >
                                  {/* Drag Handle Icon */}
                                  <div className="absolute right-2 top-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical size={16} />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full uppercase tracking-wide w-fit">
                                        {lead.company}
                                      </span>
                                      
                                      {/* ✏️ DEDICATED EDIT BUTTON */}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation(); // 👈 Prevents the drag library from seeing the click
                                          setEditingLead(lead);
                                        }}
                                        className="text-slate-400 hover:text-brand-600 transition-colors p-1"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-bold text-slate-900 leading-tight">{lead.name}</h4>
                                      <p className="text-xs text-slate-500 mt-0.5">{lead.role}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                      <DollarSign size={12} />
                                      {lead.value > 0 ? lead.value.toLocaleString() : '0'}
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