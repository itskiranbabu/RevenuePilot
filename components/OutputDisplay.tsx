import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface OutputDisplayProps {
  content: string | null;
  isLoading: boolean;
  onSave: (content: string) => void;
  onRefine: (instruction: string) => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, isLoading, onSave, onRefine }) => {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenuepilot-output-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWebhookSend = async () => {
    const settings = localStorage.getItem('revenuepilot_settings');
    const webhookUrl = settings ? JSON.parse(settings).webhookUrl : null;

    if (!webhookUrl) {
      alert("Please configure a Webhook URL in Settings first.");
      return;
    }

    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      alert(`Successfully sent content to: ${webhookUrl}`);
    }, 1500);
  };
  
  const submitRefinement = (e: React.FormEvent) => {
    e.preventDefault();
    if (refineInstruction.trim()) {
      onRefine(refineInstruction);
      setRefineInstruction('');
      setRefineOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 min-h-[400px]">
        <Icons.Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
        <p className="animate-pulse">RevenuePilot Agent is thinking...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Icons.Sparkles size={32} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-medium mb-1">Ready to Generate</h3>
        <p className="text-sm max-w-xs text-center">Fill out the configuration on the left to activate the agent.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden relative transition-colors">
      <div className="border-b border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Icons.Zap size={18} className="text-amber-500" /> Generated Output
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setRefineOpen(!refineOpen)}
            className={`p-2 rounded-lg transition-colors border ${refineOpen ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
            title="Refine with AI"
          >
             <Icons.Wand2 size={18} />
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button 
            onClick={handleWebhookSend}
            disabled={sending}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Send to Webhook"
          >
             {sending ? <Icons.Loader2 size={18} className="animate-spin" /> : <Icons.Webhook size={18} />}
          </button>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Copy to clipboard"
          >
            {copied ? <Icons.Check size={18} /> : <Icons.Copy size={18} />}
          </button>
          <button 
            onClick={() => onSave(content)}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Save to Project"
          >
            <Icons.Bookmark size={18} />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700" 
            title="Download Text"
          >
            <Icons.Download size={18} />
          </button>
        </div>
      </div>

      {refineOpen && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/50 animate-in slide-in-from-top-2">
          <form onSubmit={submitRefinement} className="flex gap-2">
             <input 
               type="text" 
               className="flex-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-indigo-300 dark:placeholder-indigo-700"
               placeholder="Example: Make it shorter, Add more emojis, Change tone to witty..."
               value={refineInstruction}
               onChange={(e) => setRefineInstruction(e.target.value)}
               autoFocus
             />
             <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
               Refine
             </button>
          </form>
        </div>
      )}

      <div className="p-6 overflow-y-auto flex-grow bg-white dark:bg-slate-900 transition-colors">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

export default OutputDisplay;