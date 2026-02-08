import React, { useState } from 'react';
import { Search, Sparkles, User, Building2, Briefcase, Send, Loader2, BrainCircuit, Save, CheckCircle, Zap } from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore'; 
import { db } from '../lib/firebase'; 
import { Lead, Dossier } from '../types'; 
import { useUser } from '@clerk/clerk-react'; 
import { GoogleGenerativeAI } from "@google/generative-ai"; 

interface DashboardViewProps {
  leads: Lead[];
  isDemoMode: boolean; // 👈 1. Added this to the interface
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, isDemoMode }) => {
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

    // 🛡️ 2. THE DEMO BYPASS
    let canProceed = isDemoMode; 

    if (!isDemoMode) {
      if (!user) return; // Not in demo and not logged in? Stop.
      
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData && userData.credits <= 0) {
        alert("⚠️ You have 0 credits remaining. Please upgrade to continue!");
        return;
      }
      canProceed = true;
    }

    if (!canProceed) return;

    setLoading(true);
    setDossier(null);
    setSaved(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // RESTORED: Your exact Gemini 2.5 Flash logic
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

      // 💰 3. ONLY DEDUCT IF IT'S A REAL USER
      if (!isDemoMode && user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          credits: increment(-1)
        });
      }

    } catch (error: any) {
      console.error("AI Analysis failed", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async () => {
    // Demo users can't save to a database because they don't have a userId
    if (!dossier || !user || isDemoMode) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'leads'), {
        userId: user.id, 
        name,
        company,
        role,
        stage: 'New', 
        dossier, 
        value: 0,
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
    <div className="space-y-6 animate-fade-in">
      {/* ... (Header and Input Form remain the same as your working code) ... */}
      
      {/* Change the button text/color if in demo mode to be extra helpful */}
      <button 
        type="submit" 
        disabled={loading}
        className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
          isDemoMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-brand-600 hover:bg-brand-500'
        }`}
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {loading ? 'Searching Live Web...' : isDemoMode ? 'Try Demo Search' : 'Generate Dossier'}
      </button>

      {/* Results & Save Lead logic */}
      <div className="lg:col-span-2">
        {dossier && (
          <div className="space-y-6">
            <div className="flex justify-end">
              {isDemoMode ? (
                <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl border border-brand-100 text-sm font-bold">
                  ✨ Log in to save this to your Pipeline
                </div>
              ) : (
                <button 
                  onClick={handleSaveLead}
                  disabled={saving || saved}
                  className="bg-white border p-3 rounded-xl font-bold flex items-center gap-2"
                >
                  {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                  {saved ? 'Saved' : 'Save Lead'}
                </button>
              )}
            </div>
            {/* ... (Render Dossier details below) ... */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;