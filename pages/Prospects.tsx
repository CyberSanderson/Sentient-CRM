import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import PipelineView from '../components/PipelineView';
import { Lead, LeadStage } from '../types';
import { Loader } from 'lucide-react';

export default function Prospects() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // 1. Fetch all leads (In a real app, you'd filter by userId here)
        const q = query(collection(db, "leads"));
        const querySnapshot = await getDocs(q);
        
        // 2. Format the data to prevent crashes
        const fetchedLeads: Lead[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          return {
            id: doc.id,
            // ⚠️ SAFE FALLBACKS: If data is missing, use these defaults
            company: data.company || "Unknown Company",
            name: data.contactName || "Unknown Contact",
            stage: (data.status as LeadStage) || LeadStage.NEW,
            value: data.value || 0, // Prevents .toLocaleString() crash
            lastContact: data.createdAt ? data.createdAt.toDate() : new Date(),
            aiScore: data.aiScore || 50,
            // Keep other fields if you have them
            email: data.email || "",
            role: data.role || "",
          } as Lead;
        });

        setLeads(fetchedLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <Loader className="animate-spin mr-2" /> Loading Pipeline...
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-slate-50">
      <PipelineView leads={leads} setLeads={setLeads} />
    </div>
  );
}