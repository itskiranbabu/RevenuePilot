import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useToast } from '../context/ToastContext';

const BillingView: React.FC = () => {
  const { showToast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<'starter' | 'pro' | 'agency'>('starter');
  const [processing, setProcessing] = useState<string | null>(null);

  const handleUpgrade = (plan: 'pro' | 'agency') => {
    setProcessing(plan);
    
    // Simulate API/Stripe delay
    setTimeout(() => {
      setProcessing(null);
      setCurrentPlan(plan);
      showToast(`Successfully upgraded to ${plan.toUpperCase()} Plan!`, 'success');
      
      // Update local storage to persist visually for this session
      localStorage.setItem('revenuepilot_plan', plan);
    }, 2000);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Upgrade your Workspace</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">Choose the plan that fits your growth needs. Cancel anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-12">
        {/* Starter Plan */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl p-8 border shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 ${currentPlan === 'starter' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Starter</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">For solo founders and testing.</p>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">$29<span className="text-base font-normal text-slate-400">/mo</span></div>
          
          <button 
            disabled
            className="w-full py-3 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold mb-8 cursor-default"
          >
            {currentPlan === 'starter' ? 'Current Plan' : 'Downgrade'}
          </button>

          <ul className="space-y-4 flex-1">
            <FeatureItem text="500 AI Generations / mo" />
            <FeatureItem text="Access to 10 Basic Agents" />
            <FeatureItem text="Export to Text" />
            <FeatureItem text="Email Support" />
          </ul>
        </div>

        {/* Pro Plan */}
        <div className={`bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 border shadow-xl flex flex-col transform md:-translate-y-4 relative transition-all duration-300 ${currentPlan === 'pro' ? 'border-indigo-400 ring-2 ring-indigo-400' : 'border-slate-800 dark:border-slate-700'}`}>
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Popular</div>
          <h3 className="text-lg font-semibold text-white mb-2">Growth</h3>
          <p className="text-slate-400 text-sm mb-6">For scaling startups and agencies.</p>
          <div className="text-4xl font-bold text-white mb-6">$79<span className="text-base font-normal text-slate-400">/mo</span></div>
          
          <button 
            onClick={() => handleUpgrade('pro')}
            disabled={currentPlan === 'pro' || !!processing}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all mb-8 shadow-lg ${
               currentPlan === 'pro' 
               ? 'bg-green-500 text-white cursor-default' 
               : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/50'
            }`}
          >
            {processing === 'pro' ? (
               <span className="flex items-center justify-center gap-2"><Icons.Loader2 className="animate-spin" size={18} /> Processing...</span>
            ) : currentPlan === 'pro' ? (
               <span className="flex items-center justify-center gap-2"><Icons.Check size={18} /> Active Plan</span>
            ) : (
               'Upgrade Now'
            )}
          </button>

          <ul className="space-y-4 flex-1">
            <FeatureItem text="Unlimited Generations" light />
            <FeatureItem text="Access to All 14 Agents" light />
            <FeatureItem text="Project Management" light />
            <FeatureItem text="Priority Support" light />
            <FeatureItem text="Early Access to Beta Features" light />
          </ul>
        </div>

        {/* Agency Plan */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl p-8 border shadow-sm flex flex-col transition-all duration-300 ${currentPlan === 'agency' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Agency</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">For large teams and high volume.</p>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">$199<span className="text-base font-normal text-slate-400">/mo</span></div>
          
          <button 
            onClick={() => handleUpgrade('agency')}
            disabled={currentPlan === 'agency' || !!processing}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mb-8 border-2 ${
               currentPlan === 'agency'
               ? 'bg-green-500 text-white border-green-500'
               : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-500'
            }`}
          >
             {processing === 'agency' ? (
               <span className="flex items-center justify-center gap-2"><Icons.Loader2 className="animate-spin" size={18} /> Processing...</span>
            ) : currentPlan === 'agency' ? (
               <span className="flex items-center justify-center gap-2"><Icons.Check size={18} /> Active Plan</span>
            ) : (
               'Contact Sales'
            )}
          </button>

          <ul className="space-y-4 flex-1">
            <FeatureItem text="Everything in Growth" />
            <FeatureItem text="API Access" />
            <FeatureItem text="Custom AI Model Fine-tuning" />
            <FeatureItem text="Dedicated Account Manager" />
            <FeatureItem text="Team Collaboration Tools" />
          </ul>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, light = false }: { text: string, light?: boolean }) => (
  <li className={`flex items-start gap-3 text-sm ${light ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
    <Icons.CheckCircle2 className={`shrink-0 ${light ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`} size={18} />
    <span>{text}</span>
  </li>
);

export default BillingView;