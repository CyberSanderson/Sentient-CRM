import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, DollarSign, Building2, User, Briefcase } from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead } from '../types';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, lead }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState(0);
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  // Load lead data when the modal opens
  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setCompany(lead.company);
      setValue(lead.value || 0);
      setRole(lead.role);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const leadRef = doc(db, 'leads', lead.id);
      await updateDoc(leadRef, {
        name,
        company,
        value: Number(value), // Ensure it's a number
        role
      });
      onClose();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this lead? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'leads', lead.id));
        onClose();
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Edit Deal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Deal Value (The Most Important Field) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deal Value ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
              <input 
                type="number" 
                required
                className="w-full pl-10 p-3 bg-green-50 border border-green-200 text-green-800 font-bold rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-lg"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              <Trash2 size={16} />
              Delete Lead
            </button>
            
            <button 
              type="submit" 
              disabled={saving}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save Changes'}
              {!saving && <Save size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;