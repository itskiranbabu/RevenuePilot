import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AGENTS } from '../constants';

const AnalyticsView: React.FC = () => {
  const [stats, setStats] = useState({
    totalGenerations: 0,
    projects: 0,
    mostUsedAgent: 'None',
    creditsUsed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock for Demo
      const isDemo = !supabase.auth.getSession(); // simplified check, real check in App
      // But here we rely on Supabase, so we'll wrap in try/catch and use demo data on error if session missing
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
         // Demo Data
         setStats({
            totalGenerations: 124,
            projects: 3,
            mostUsedAgent: 'Ad Copy Agent',
            creditsUsed: 450
         });
         setLoading(false);
         return;
      }

      // Parallel fetch
      const [contentRes, projectsRes] = await Promise.all([
        supabase.from('generated_content').select('agent_id, content').eq('user_id', session.user.id),
        supabase.from('projects').select('id').eq('user_id', session.user.id)
      ]);

      const content = contentRes.data || [];
      const projectsCount = projectsRes.data?.length || 0;

      // Calculate Most Used Agent
      const agentCounts: Record<string, number> = {};
      content.forEach(c => {
        agentCounts[c.agent_id] = (agentCounts[c.agent_id] || 0) + 1;
      });
      const topAgentId = Object.keys(agentCounts).reduce((a, b) => agentCounts[a] > agentCounts[b] ? a : b, '');
      const topAgentName = AGENTS.find(a => a.id === topAgentId)?.name || 'None';

      // Estimate Credits (words / 100)
      const totalWords = content.reduce((acc, curr) => acc + (curr.content?.split(' ').length || 0), 0);
      const credits = Math.ceil(totalWords / 100);

      setStats({
        totalGenerations: content.length,
        projects: projectsCount,
        mostUsedAgent: topAgentName,
        creditsUsed: credits
      });
    } catch (e) {
      console.error(e);
      // Fallback
       setStats({
            totalGenerations: 0,
            projects: 0,
            mostUsedAgent: 'None',
            creditsUsed: 0
         });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Icons.Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Real-time usage statistics from your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Generations" 
          value={stats.totalGenerations.toString()} 
          icon={<Icons.Zap className="text-amber-500" />} 
        />
        <StatCard 
          title="Active Projects" 
          value={stats.projects.toString()} 
          icon={<Icons.Folder className="text-blue-500" />} 
        />
        <StatCard 
          title="Top Agent" 
          value={stats.mostUsedAgent} 
          icon={<Icons.Star className="text-green-500" />} 
          isText
        />
        <StatCard 
          title="Credits Used" 
          value={stats.creditsUsed.toString()} 
          subtext="Standard Usage" 
          icon={<Icons.CreditCard className="text-indigo-500" />} 
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
          <Icons.BarChart2 size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Detailed Reporting</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
          Advanced charts for CTR prediction and A/B test simulation are available in the Enterprise plan.
        </p>
        <button className="mt-6 px-6 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
          Upgrade to View
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, isText = false }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
    </div>
    <div className={`${isText ? 'text-xl' : 'text-3xl'} font-bold text-slate-900 dark:text-white mb-1 truncate`} title={value}>
      {value}
    </div>
    <div className="text-sm text-slate-500 dark:text-slate-400">{subtext || title}</div>
  </div>
);

export default AnalyticsView;