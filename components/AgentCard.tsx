import React from 'react';
import { AgentConfig } from '../types';
import * as Icons from 'lucide-react';

interface AgentCardProps {
  agent: AgentConfig;
  onClick: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  // Dynamic Icon rendering
  const IconComponent = (Icons as any)[agent.iconName] || Icons.HelpCircle;

  return (
    <div 
      onClick={() => onClick(agent.id)}
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <IconComponent size={24} />
        </div>
      </div>
      <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{agent.name}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm flex-grow leading-relaxed">{agent.description}</p>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Launch Agent <Icons.ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  );
};

export default AgentCard;