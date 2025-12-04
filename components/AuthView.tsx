import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import * as Icons from 'lucide-react';

interface AuthViewProps {
  onDemoLogin?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onDemoLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Bypass check for Demo Credentials
    if (email === 'demo@revenuepilot.ai' && password === 'password123' && onDemoLogin) {
      setTimeout(() => {
        onDemoLogin();
        setLoading(false);
      }, 1000); // Fake delay
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Success! Please check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    const testEmail = 'demo@revenuepilot.ai';
    const testPass = 'password123';
    setEmail(testEmail);
    setPassword(testPass);
    setIsSignUp(false);
    
    // Auto-submit logic handled by user clicking the button below or manual sign in
    // Note: We don't auto-submit here to let the user see the fields
  };

  const executeDemoLogin = () => {
    fillTestCredentials();
    setLoading(true);
    if (onDemoLogin) {
      setTimeout(() => {
        onDemoLogin();
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex transition-colors duration-300">
      {/* Left Side - Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-slate-950 z-0"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Icons.Plane className="text-white" size={20} />
             </div>
             <span className="font-bold text-xl tracking-tight">RevenuePilot</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Automate your <br/>
            <span className="text-indigo-400">Revenue Growth</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            Deploy autonomous AI agents to build funnels, write copy, and optimize ads 24/7.
          </p>
        </div>

        <div className="relative z-10 bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50">
           <div className="flex gap-1 text-amber-400 mb-3">
             {[1,2,3,4,5].map(i => <Icons.Star key={i} size={16} fill="currentColor" />)}
           </div>
           <p className="text-slate-200 italic mb-4">"RevenuePilot helped us scale our ad spend by 300% while reducing CPA. The ad copy agent is indistinguishable from our senior copywriter."</p>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">JS</div>
             <div>
               <p className="font-semibold text-sm">James Smith</p>
               <p className="text-xs text-slate-400">CMO at TechFlow</p>
             </div>
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-slate-900 transition-colors">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden mb-8">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none mb-4">
               <Icons.Plane className="text-white" size={24} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">RevenuePilot</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isSignUp ? 'Get started for free' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {isSignUp ? 'Already have an account? ' : 'New to RevenuePilot? '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <Icons.AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                   loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50'
                }`}
              >
                {loading ? <Icons.Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
             <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Demo Access</h4>
                <div className="flex justify-between items-center text-sm text-slate-700 dark:text-slate-300 mb-1">
                   <span>Email: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono">demo@revenuepilot.ai</code></span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-700 dark:text-slate-300 mb-3">
                   <span>Pass: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono">password123</code></span>
                </div>
                <button 
                  type="button"
                  onClick={executeDemoLogin}
                  className="w-full py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                   <Icons.Play size={14} /> One-Click Demo Login
                </button>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Bypasses authentication for testing.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthView;