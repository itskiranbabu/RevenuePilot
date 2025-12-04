import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AGENTS } from './constants';
import { AgentConfig, AgentCategory, View } from './types';
import AgentCard from './components/AgentCard';
import AgentWorkspace from './components/AgentWorkspace';
import ProjectView from './components/ProjectView';
import AnalyticsView from './components/AnalyticsView';
import BillingView from './components/BillingView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import * as Icons from 'lucide-react';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chainedContent, setChainedContent] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>('Free');
  
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Check for Demo Session
    const demoSession = localStorage.getItem('revenuepilot_demo_session');
    
    if (demoSession) {
        setSession(JSON.parse(demoSession));
        setLoading(false);
    } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
        return () => subscription.unsubscribe();
    }
    
    // Check for local storage plan simulation
    const savedPlan = localStorage.getItem('revenuepilot_plan');
    if (savedPlan) setPlan(savedPlan === 'starter' ? 'Free' : savedPlan.toUpperCase());

  }, []);

  const handleDemoLogin = () => {
    const mockSession = {
        user: { id: 'demo-user', email: 'demo@revenuepilot.ai' },
        access_token: 'demo-token'
    };
    localStorage.setItem('revenuepilot_demo_session', JSON.stringify(mockSession));
    setSession(mockSession);
  };

  const handleLogout = async () => {
    if (session?.user.id === 'demo-user') {
        localStorage.removeItem('revenuepilot_demo_session');
        setSession(null);
    } else {
        await supabase.auth.signOut();
    }
  };

  const handleChainAgent = (content: string) => {
    setChainedContent(content);
    setCurrentView('dashboard');
    setSelectedAgentId(null);
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleWorkspaceBack = () => {
    setSelectedAgentId(null);
    setChainedContent(null);
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <Icons.Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  if (!session) {
    return <AuthView onDemoLogin={handleDemoLogin} />;
  }

  const selectedAgent = AGENTS.find(a => a.id === selectedAgentId);
  const filteredAgents = activeCategory === 'All' 
    ? AGENTS 
    : AGENTS.filter(a => a.category === activeCategory);
  const categories = ['All', ...Object.values(AgentCategory)];

  // Render Logic
  const renderContent = () => {
    if (selectedAgent) {
      return (
        <AgentWorkspace 
          agent={selectedAgent} 
          initialData={chainedContent}
          onBack={handleWorkspaceBack}
          userId={session.user.id}
        />
      );
    }

    switch (currentView) {
      case 'projects':
        return <ProjectView onChain={handleChainAgent} userId={session.user.id} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'billing':
        return <BillingView />;
      case 'settings':
        return <SettingsView />;
      case 'dashboard':
      default:
        return (
          <>
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center shrink-0 sticky top-0 z-10 transition-colors">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                   {chainedContent ? "Select an agent to refine your content..." : `Welcome back, ${session.user.email?.split('@')[0]}`}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
              {chainedContent && (
                <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-4">
                   <div className="flex items-center gap-3">
                     <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                       <Icons.Workflow size={20} />
                     </div>
                     <div>
                       <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">Chain Workflow Active</h3>
                       <p className="text-sm text-indigo-700 dark:text-indigo-300">Select an agent below to use your previous output as context.</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => setChainedContent(null)}
                     className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                   >
                     Cancel
                   </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {filteredAgents.map(agent => (
                  <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onClick={handleAgentSelect} 
                  />
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shrink-0 z-20`}>
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentView('dashboard'); setSelectedAgentId(null); }}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Icons.Plane className="text-white" size={20} />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">RevenuePilot</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<Icons.LayoutGrid size={20} />} 
            label="Dashboard" 
            active={currentView === 'dashboard' && !selectedAgentId} 
            isOpen={isSidebarOpen} 
            onClick={() => { setCurrentView('dashboard'); setSelectedAgentId(null); }}
          />
          <NavItem 
            icon={<Icons.Folder size={20} />} 
            label="Projects" 
            active={currentView === 'projects'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setCurrentView('projects'); setSelectedAgentId(null); }}
          />
          <NavItem 
            icon={<Icons.BarChart2 size={20} />} 
            label="Analytics" 
            active={currentView === 'analytics'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setCurrentView('analytics'); setSelectedAgentId(null); }}
          />
          <NavItem 
            icon={<Icons.CreditCard size={20} />} 
            label="Billing" 
            active={currentView === 'billing'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setCurrentView('billing'); setSelectedAgentId(null); }}
          />
          <NavItem 
            icon={<Icons.Settings size={20} />} 
            label="Settings" 
            active={currentView === 'settings'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setCurrentView('settings'); setSelectedAgentId(null); }}
          />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className={`w-full flex items-center gap-3 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors mb-4 ${!isSidebarOpen && 'justify-center'}`}
             title="Toggle Theme"
           >
             {theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
             {isSidebarOpen && <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
           </button>

           <div className={`flex items-center gap-3 p-2 rounded-lg mb-2 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-700">
                {session.user.email?.charAt(0).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate dark:text-white">{session.user.email}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">{plan} Plan Active</p>
                </div>
              )}
           </div>
           
           <button 
             onClick={handleLogout}
             className={`w-full flex items-center gap-3 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${!isSidebarOpen && 'justify-center'}`}
             title="Sign Out"
           >
             <Icons.LogOut size={18} />
             {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
           </button>

           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="w-full mt-2 flex justify-center p-2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 rounded-lg transition-colors"
           >
             {isSidebarOpen ? <Icons.ChevronLeft size={16} /> : <Icons.ChevronRight size={16} />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden h-full relative bg-slate-50 dark:bg-slate-950 transition-colors">
        {renderContent()}
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active = false, isOpen, onClick }: NavItemProps) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
      active 
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    } ${!isOpen && 'justify-center'}`}
  >
    {icon}
    {isOpen && <span>{label}</span>}
  </button>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;