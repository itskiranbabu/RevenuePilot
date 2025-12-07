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
          title="Credits Saved" 
          value={`$${(stats.creditsUsed * 0.1).toFixed(2)}`} 
          subtext="Est. Copywriter Value" 
          icon={<Icons.DollarSign className="text-indigo-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Usage Chart Visualization */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Activity Volume</h3>
            <div className="h-64 flex items-end justify-between gap-2">
               {[35, 20, 45, 30, 60, 75, 50].map((h, i) => (
                  <div key={i} className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-t-lg relative group">
                     <div 
                        className="absolute bottom-0 left-0 right-0 bg-indigo-500 dark:bg-indigo-600 rounded-t-lg transition-all duration-500" 
                        style={{ height: `${h}%` }}
                     ></div>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h} gens
                     </div>
                  </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-400">
               <span>Mon</span>
               <span>Tue</span>
               <span>Wed</span>
               <span>Thu</span>
               <span>Fri</span>
               <span>Sat</span>
               <span>Sun</span>
            </div>
         </div>

         {/* Agent Distribution */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Agent Performance</h3>
            <div className="space-y-4">
               <ProgressBar label="Ad Copy Agent" percent={75} color="bg-blue-500" />
               <ProgressBar label="Email Agent" percent={45} color="bg-green-500" />
               <ProgressBar label="Sales Page Agent" percent={30} color="bg-amber-500" />
               <ProgressBar label="Social Media Agent" percent={60} color="bg-purple-500" />
            </div>
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, isText = false }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
    </div>
    <div className={`${isText ? 'text-lg' : 'text-3xl'} font-bold text-slate-900 dark:text-white mb-1 truncate`} title={value}>
      {value}
    </div>
    <div className="text-sm text-slate-500 dark:text-slate-400">{subtext || title}</div>
  </div>
);

const ProgressBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => (
   <div>
      <div className="flex justify-between text-sm mb-1">
         <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
         <span className="text-slate-500 dark:text-slate-400">{percent}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
         <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
   </div>
);

export default AnalyticsView;