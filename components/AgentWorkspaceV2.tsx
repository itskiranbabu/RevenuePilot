import React, { useState, useEffect } from 'react';
import { AgentConfig, InputType } from '../types';
import { generateContentStream, getSuggestions } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import OutputDisplay from './OutputDisplay';
import { useToast } from '../context/ToastContext';
import * as Icons from 'lucide-react';

interface AgentWorkspaceProps {
  agent: AgentConfig;
  initialData?: string | null;
  onBack: () => void;
  userId: string;
}

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ agent, initialData, onBack, userId }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    // If there is chained content, we DON'T overwrite specific fields blindly.
    if (initialData) {
      const targetField = agent.inputs.find(i => 
        ['context', 'currentData', 'offer', 'background', 'painPoint'].includes(i.name)
      ) || agent.inputs.find(i => i.type === InputType.TEXTAREA);

      if (targetField) {
        setFormData(prev => ({ ...prev, [targetField.name]: initialData }));
      }
    }
  }, [initialData, agent]);

  // Fetch projects for the save modal
  useEffect(() => {
    const fetchProjects = async () => {
      if (userId === 'demo-user') {
        setProjects([{ id: 'demo-p1', name: 'Demo Project' }]);
        return;
      }
      
      const { data } = await supabase.from('projects').select('id, name').eq('user_id', userId);
      if (data) setProjects(data);
    };
    fetchProjects();
  }, [userId]);

  // Auto-save when output changes
  useEffect(() => {
    if (autoSaveEnabled && output && selectedProject) {
      const timer = setTimeout(() => {
        handleSaveToProject(selectedProject, true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [output, autoSaveEnabled, selectedProject]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOutput('');
    setSuggestions([]);
    
    const missing = agent.inputs.filter(i => i.required && !formData[i.name]);
    if (missing.length > 0) {
      showToast(`Please fill in required fields: ${missing.map(i => i.label).join(', ')}`, 'error');
      setIsLoading(false);
      return;
    }

    try {
      let prompt = agent.promptTemplate(formData);
      
      // Smart Context Injection for Chaining
      if (initialData && !Object.values(formData).includes(initialData)) {
          prompt = `BACKGROUND CONTEXT FROM PREVIOUS STEP:\n"""${initialData}"""\n\nTASK:\n${prompt}`;
      }

      // Use streaming for real-time output
      await generateContentStream(
        'gemini-2.5-flash', 
        prompt, 
        agent.systemInstruction,
        (text) => setOutput(text)
      );
      
      showToast("Content generated successfully!", 'success');
      
      // Get AI suggestions after generation
      setTimeout(() => loadSuggestions(), 1000);
    } catch (error) {
      console.error(error);
      showToast("Error generating content. Please check your API key.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!output) return;
    setLoadingSuggestions(true);
    try {
      const sug = await getSuggestions(output, agent.name);
      setSuggestions(sug);
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = async (suggestion: string) => {
    if (!output) return;
    setIsLoading(true);
    
    try {
      const refinementPrompt = `Original Content:\n${output}\n\nApply this improvement: ${suggestion}\n\nProvide ONLY the improved version.`;
      
      await generateContentStream(
        'gemini-2.5-flash',
        refinementPrompt,
        "You are an expert editor applying specific improvements.",
        (text) => setOutput(text)
      );
      
      showToast("Suggestion applied!", 'success');
      setSuggestions([]);
    } catch (error) {
       console.error(error);
       showToast("Failed to apply suggestion.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!output) return;
    setIsLoading(true);
    
    try {
      const refinementPrompt = `Original Content:\n${output}\n\nInstruction: ${instruction}\n\nPlease output ONLY the refined version of the content.`;
      
      await generateContentStream(
        'gemini-2.5-flash',
        refinementPrompt,
        "You are an expert editor refining content based on user instructions.",
        (text) => setOutput(text)
      );
      
      showToast("Content refined!", 'success');
    } catch (error) {
       console.error(error);
       showToast("Failed to refine content.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToProject = async (projectId: string, isAutoSave = false) => {
    if (!output) return;
    
    // Demo Mode Simulation
    if (userId === 'demo-user') {
      showToast(isAutoSave ? "Auto-saved! (Demo)" : "Saved successfully! (Demo Mode)", 'success');
      setShowSaveModal(false);
      return;
    }

    const { error } = await supabase.from('generated_results').insert([{
      project_id: projectId,
      user_id: userId,
      agent_id: agent.id,
      content: output,
      inputs: formData
    }]);

    if (error) {
      showToast("Failed to save to project.", 'error');
      console.error(error);
    } else {
      showToast(isAutoSave ? "Auto-saved!" : "Saved successfully!", 'success');
      if (!isAutoSave) setShowSaveModal(false);
    }
  };

  const IconComponent = (Icons as any)[agent.iconName] || Icons.Bot;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
            <Icons.ArrowLeft size={20} />
          </button>
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <IconComponent size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">{agent.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Powered Workflow • Real-time Streaming</p>
          </div>
        </div>
        
        {/* Auto-save toggle */}
        {projects.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              disabled={!autoSaveEnabled}
            >
              <option value="">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="rounded"
              />
              Auto-save
            </label>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Input */}
        <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-colors">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Configuration</h2>
          
          {initialData && (
             <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 border-b border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                   <Icons.Link size={14} className="text-indigo-600 dark:text-indigo-400" />
                   <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">Context Attached</span>
                </div>
                <div className="p-3 text-xs text-slate-600 dark:text-slate-400 max-h-24 overflow-y-auto italic">
                   "{initialData.substring(0, 150)}..."
                </div>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {agent.inputs.map((input) => (
              <div key={input.name}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {input.label} {input.required && <span className="text-red-500">*</span>}
                </label>
                
                {input.type === InputType.TEXTAREA ? (
                  <textarea
                    required={input.required}
                    rows={6}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder={input.placeholder}
                    value={formData[input.name] || input.defaultValue || ''}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                  />
                ) : input.type === InputType.SELECT ? (
                  <div className="relative">
                    <select
                      required={input.required}
                      className="w-full appearance-none rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                      value={formData[input.name] || input.defaultValue || ''}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                    >
                      {input.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <Icons.ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                  </div>
                ) : (
                  <input
                    type="text"
                    required={input.required}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder={input.placeholder}
                    value={formData[input.name] || input.defaultValue || ''}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${
                isLoading ? 'bg-indigo-400 dark:bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <><Icons.Loader2 className="animate-spin" size={18} /> Generating...</>
              ) : (
                <>Generate Content <Icons.Sparkles size={18} /></>
              )}
            </button>
          </form>

          {/* AI Suggestions Panel */}
          {suggestions.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Icons.Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">AI Suggestions</h3>
              </div>
              <div className="space-y-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => applySuggestion(sug)}
                    className="w-full text-left p-2 text-xs bg-white dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 overflow-hidden transition-colors">
          <OutputDisplay 
            content={output} 
            isLoading={isLoading} 
            onSave={() => output && setShowSaveModal(true)}
            onRefine={handleRefine}
          />
          
          {output && !isLoading && suggestions.length === 0 && !loadingSuggestions && (
            <button
              onClick={loadSuggestions}
              className="mt-4 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Icons.Lightbulb size={16} /> Get AI Suggestions
            </button>
          )}
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-6 w-96 shadow-2xl animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Save to Project</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {projects.length > 0 ? projects.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => handleSaveToProject(p.id)}
                    className="w-full text-left p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                  >
                    <Icons.Folder size={16} /> {p.name}
                  </button>
                )) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No projects found. Please create one in the Projects tab first.</p>
                )}
              </div>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentWorkspace;
