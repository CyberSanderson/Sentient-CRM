import React, { useEffect, useState } from 'react';
import { User, Search, FileText, Globe, BrainCircuit, CheckCircle2 } from 'lucide-react';

export const HeroVisual = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] md:h-[500px] flex items-center justify-center select-none pointer-events-none overflow-hidden">
      
      {/* 💉 STYLES */}
      <style>{`
        @keyframes beam-flow {
          0% { stroke-dashoffset: 100; opacity: 0; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        .animate-beam {
          animation: beam-flow 2s linear infinite;
        }
      `}</style>

      {/* =========================================================
          1. INPUT NODE 
          Mobile: Top Center | Desktop: Left Side
      ========================================================= */}
      <div className={`absolute 
          top-[5%] left-1/2 -translate-x-1/2 
          md:top-1/2 md:left-[10%] md:translate-x-0 md:-translate-y-1/2 
          transition-all duration-500 z-20
          ${step === 0 ? 'scale-110 opacity-100' : 'scale-100 opacity-60'}
      `}>
        <div className={`bg-white p-4 rounded-2xl shadow-xl border w-48 relative transition-colors ${step === 0 ? 'border-brand-200 ring-4 ring-brand-50' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
              <User size={16} />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Target</div>
          </div>
          <div className="h-8 bg-slate-50 rounded border border-slate-100 flex items-center px-3">
            <span className="text-sm font-semibold text-slate-700">Robert Troy</span>
          </div>
          {step === 0 && <div className="absolute -right-2 -top-2 bg-brand-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md animate-bounce">New Lead</div>}
        </div>
      </div>

      {/* =========================================================
          SVG CONNECTING LINES 
          We render two different SVGs for responsiveness
      ========================================================= */}
      
      {/* 📱 MOBILE SVG (Vertical Lines) */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none md:hidden">
        {/* Line 1: Input (Top) to Brain (Center) */}
        <line x1="50%" y1="18%" x2="50%" y2="40%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
        {step >= 1 && <line x1="50%" y1="18%" x2="50%" y2="40%" stroke="#14b8a6" strokeWidth="3" className="animate-beam" strokeDasharray="100" />}
        
        {/* Line 2: Brain (Center) to Output (Bottom) */}
        <line x1="50%" y1="60%" x2="50%" y2="82%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
        {step >= 2 && <line x1="50%" y1="60%" x2="50%" y2="82%" stroke="#8b5cf6" strokeWidth="3" className="animate-beam" strokeDasharray="100" />}
      </svg>

      {/* 💻 DESKTOP SVG (Horizontal Lines) */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden md:block">
        {/* Line 1: Input (Left) to Brain (Center) */}
        <line x1="25%" y1="50%" x2="45%" y2="50%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
        {step >= 1 && <line x1="25%" y1="50%" x2="45%" y2="50%" stroke="#14b8a6" strokeWidth="3" className="animate-beam" strokeDasharray="100" />}
        
        {/* Line 2: Brain (Center) to Output (Right) */}
        <line x1="55%" y1="50%" x2="75%" y2="50%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
        {step >= 2 && <line x1="55%" y1="50%" x2="75%" y2="50%" stroke="#8b5cf6" strokeWidth="3" className="animate-beam" strokeDasharray="100" />}
      </svg>


      {/* =========================================================
          2. THE AI ENGINE (Center)
          Stays in the middle for both
      ========================================================= */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500 ${step === 1 ? 'scale-110' : 'scale-100'}`}>
        <div className="relative">
          {step === 1 && <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse" />}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-700 w-32 h-32 flex flex-col items-center justify-center gap-2">
            <BrainCircuit size={32} className={`text-brand-400 ${step === 1 ? 'animate-pulse' : ''}`} />
            <div className="text-[10px] font-bold text-slate-400 text-center">
              {step === 0 ? "Idle" : step === 1 ? "Researching" : "Done"}
            </div>
          </div>
          
          {/* Floating Sources (Only appear when scanning) */}
          <div className={`absolute -right-16 top-0 md:-top-12 md:left-1/2 md:-translate-x-1/2 bg-white p-2 rounded-lg shadow-lg border border-slate-100 flex items-center gap-2 transition-all duration-300 ${step === 1 ? 'opacity-100 translate-x-0 md:translate-y-0' : 'opacity-0 -translate-x-4 md:translate-y-4'}`}>
             <Globe size={14} className="text-blue-500" /> <span className="text-[10px] font-bold text-slate-600">Web</span>
          </div>
           <div className={`absolute -left-16 bottom-0 md:-bottom-12 md:left-1/2 md:-translate-x-1/2 bg-white p-2 rounded-lg shadow-lg border border-slate-100 flex items-center gap-2 transition-all duration-300 ${step === 1 ? 'opacity-100 translate-x-0 md:translate-y-0' : 'opacity-0 translate-x-4 md:-translate-y-4'}`}>
             <Search size={14} className="text-green-500" /> <span className="text-[10px] font-bold text-slate-600">News</span>
          </div>
        </div>
      </div>


      {/* =========================================================
          3. THE DOSSIER (Output)
          Mobile: Bottom Center | Desktop: Right Side
      ========================================================= */}
      <div className={`absolute 
          bottom-[5%] left-1/2 -translate-x-1/2 
          md:top-1/2 md:bottom-auto md:left-auto md:right-[10%] md:translate-x-0 md:-translate-y-1/2 
          transition-all duration-500 z-20
          ${step >= 2 ? 'scale-110 opacity-100' : 'scale-100 opacity-50 grayscale'}
      `}>
        <div className="bg-white p-5 rounded-2xl shadow-xl border border-purple-100 w-56 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
            <FileText size={16} className="text-purple-600" />
            <span className="text-[10px] font-bold text-purple-600 uppercase">Dossier Ready</span>
          </div>
          
          {/* Content Loading Effect */}
          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <div className="h-2 w-16 bg-slate-200 rounded" />
                <div className="text-[8px] font-bold text-green-600 bg-green-50 px-1 rounded">98% Match</div>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded" />
             <div className="h-2 w-3/4 bg-slate-100 rounded" />
             
             {step >= 2 && (
                 <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-100 animate-fade-in-up">
                    <div className="text-[9px] text-purple-800 font-medium">"Pain Point: Scaling Ops..."</div>
                 </div>
             )}
          </div>

          {step >= 2 && <div className="absolute top-0 right-0 p-2"><CheckCircle2 size={20} className="text-green-500 fill-green-100" /></div>}
        </div>
      </div>

    </div>
  );
};