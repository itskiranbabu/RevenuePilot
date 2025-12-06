import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AGENTS } from '../constants';

const AnalyticsView: React.FC = () => {
  const [stats, setStats] = useState({
    totalGenerations: 0,
    projects: 0,
    mostUsedAgent: 'None',
    creditsUsed: 0,
    thisWeek: 0,
    avgPerProject: 0
  });
  const [loading, setLoading] = useState(true);
  const [agentBreakdown, setAgentBreakdown] = useState<Array<{name: string, count: number}>>([]);

  useEffect(() => {
    fetchStats();
    
    // Real-time subscription for new generations
    const subscription = supabase
      .channel('analytics-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'generated_results' }, 
        () => fetchStats()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
            creditsUsed: 450,
            thisWeek: 23,
            avgPerProject: 41
         });
         setAgentBreakdown([
           { name: 'Ad Copy Agent', count: 45 },
           { name: 'Email Agent', count: 32 },
           { name: 'Sales Page Agent', count: 28 },
           { name: 'Video Ads Agent', count: 19 }
         ]);
         setLoading(false);
         return;
      }

      // Parallel fetch for better performance
      const [contentRes, projectsRes] = await Promise.all([
        supabase.from('generated_results').select('agent_id, content, created_at').eq('user_id', session.user.id),
        supabase.from('projects').select('id').eq('user_id', session.user.id)
      ]);

      const content = contentRes.data || [];
      const projectsCount = projectsRes.data?.length || 0;

      // Calculate Most Used Agent
      const agentCounts: Record<string, number> = {};
      content.forEach(c => {
        agentCounts[c.agent_id] = (agentCounts[c.agent_id] || 0) + 1;
      });
      
      const topAgentId = Object.keys(agentCounts).reduce((a, b) => 
        agentCounts[a] > agentCounts[b] ? a : b, ''
      );
      const topAgentName = AGENTS.find(a => a.id === topAgentId)?.name || 'None';

      // Agent breakdown for chart
      const breakdown = Object.entries(agentCounts)
        .map(([id, count]) => ({
          name: AGENTS.find(a => a.id === id)?.name || id,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setAgentBreakdown(breakdown);

      // Calculate this week's generations
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekCount = content.filter(c => 
        new Date(c.created_at) > oneWeekAgo
      ).length;

      // Estimate Credits (words / 100)
      const totalWords = content.reduce((acc, curr) => 
        acc + (curr.content?.split(' ').length || 0), 0
      );
      const credits = Math.ceil(totalWords / 100);

      // Average per project
      const avgPerProject = projectsCount > 0 
        ? Math.round(content.length / projectsCount) 
        : 0;

      setStats({
        totalGenerations: content.length,
        projects: projectsCount,
        mostUsedAgent: topAgentName,
        creditsUsed: credits,
        thisWeek: thisWeekCount,
        avgPerProject
      });
    } catch (e) {
      console.error(e);
      // Fallback to demo data
      setStats({
        totalGenerations: 0,
        projects: 0,
        mostUsedAgent: 'None',
        creditsUsed: 0,
        thisWeek: 0,
        avgPerProject: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-full">
      <Icons.Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Live Analytics
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
              <Icons.Wifi size={10} /> Real-time
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time usage statistics from your workspace.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          <Icons.RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Generations" 
          value={stats.totalGenerations.toString()} 
          icon={<Icons.Zap className="text-amber-500" />}
          trend={stats.thisWeek > 0 ? `+${stats.thisWeek} this week` : undefined}
        />
        <StatCard 
          title="Active Projects" 
          value={stats.projects.toString()} 
          icon={<Icons.Folder className="text-blue-500" />}
          trend={stats.avgPerProject > 0 ? `${stats.avgPerProject} avg/project` : undefined}
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
        <StatCard 
          title="This Week" 
          value={stats.thisWeek.toString()} 
          icon={<Icons.TrendingUp className="text-purple-500" />}
          subtext="New Generations"
        />
        <StatCard 
          title="Efficiency" 
          value={stats.avgPerProject > 0 ? `${stats.avgPerProject}x` : '0x'} 
          icon={<Icons.Gauge className="text-cyan-500" />}
          subtext="Avg per Project"
        />
      </div>

      {/* Agent Usage Breakdown */}
      {agentBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Icons.BarChart2 size={20} className="text-indigo-600" />
            Top Agents by Usage
          </h3>
          <div className="space-y-3">
            {agentBreakdown.map((agent, idx) => {
              const maxCount = agentBreakdown[0].count;
              const percentage = (agent.count / maxCount) * 100;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{agent.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">{agent.count} uses</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-full mb-4 shadow-lg">
          <Icons.TrendingUp size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Advanced Analytics</h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
          Unlock detailed performance metrics, A/B testing insights, conversion tracking, and predictive analytics with our Enterprise plan.
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
            Upgrade to Enterprise
          </button>
          <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, isText = false, trend }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
      {trend && (
        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className={`${isText ? 'text-xl' : 'text-3xl'} font-bold text-slate-900 dark:text-white mb-1 truncate`} title={value}>
      {value}
    </div>
    <div className="text-sm text-slate-500 dark:text-slate-400">{subtext || title}</div>
  </div>
);

export default AnalyticsView;
