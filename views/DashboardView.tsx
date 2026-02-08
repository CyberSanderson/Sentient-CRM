import React, { useState } from 'react';
import { Search, Sparkles, User, Building2, Briefcase, Send, Loader2, BrainCircuit, Save, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore'; 
import { db } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useUser } from '@clerk/clerk-react'; 
import { GoogleGenerativeAI } from "@google/generative-ai"; 

interface DashboardViewProps {
  leads: Lead[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads }) => {
  const { user } = useUser(); 
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 🛑 1. CREDIT CHECK
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData && userData.credits <= 0) {
      alert("No credits left! Please upgrade to continue searching.");
      return;
    }

    setLoading(true);
    setDossier(null);
    setSaved(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        tools: [{ googleSearch: {} } as any] 
      });

      const prompt = `You are a B2B Sales Expert. Use Google Search to find real-time info about ${name}, ${role} at ${company}. Return a valid JSON object with personality, painPoints (array), iceBreakers (array), and emailDraft.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiData = JSON.parse(text);
      setDossier(aiData);

      // ✅ 2. DEDUCT CREDIT
      await updateDoc(userRef, {
        credits: increment(-1)
      });

    } catch (error: any) {
      console.error("AI Analysis failed", error);
      alert("Analysis failed. Check your API key or model availability.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async () => {
    if (!dossier || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'leads'), {
        userId: user.id, 
        name,
        company,
        role,
        stage: 'New', 
        value: 0, 
        dossier, 
        aiScore: Math.floor(Math.random() * 35) + 60, 
        createdAt: new Date()
      });
      setSaved(true);
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Research Center</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleAnalyze} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required />
            <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Role" value={role} onChange={e => setRole(e.target.value)} />
            
            <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {loading ? 'Searching...' : 'Generate Dossier'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {dossier && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={handleSaveLead} disabled={saving || saved} className="bg-white border p-3 rounded-xl font-bold">
                  {saved ? 'Saved' : 'Save Lead'}
                </button>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-brand-500">
                <p className="text-slate-600">{dossier.personality}</p>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-sm">
                {dossier.emailDraft}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;