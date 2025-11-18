import React from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white border-t md:border border-slate-200 rounded-t-2xl md:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] md:max-h-[85vh] flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-2 text-brand-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 truncate pr-4">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 md:p-6 overflow-y-auto bg-slate-50 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 animate-pulse text-center">Consulting Gemini AI Models...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-sm md:text-base">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 safe-area-pb">
          {!isLoading && content && (
             <button 
             onClick={handleCopy}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
           >
             {copied ? <Check size={16} className="text-emerald-600"/> : <Copy size={16}/>}
             {copied ? 'Copied' : 'Copy'}
           </button>
          )}
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-brand-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;