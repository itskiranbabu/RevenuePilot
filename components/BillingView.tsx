import React from 'react';
import * as Icons from 'lucide-react';

const BillingView: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide mb-4 border border-indigo-200 dark:border-indigo-700">
          Public Beta Access
        </span>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">RevenuePilot is currently Free</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          We are in early access. Enjoy all Enterprise features on the house while we build the future of revenue automation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-12">
        {/* Starter Plan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative opacity-75 grayscale hover:grayscale-0 transition-all">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Starter</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">For solo founders.</p>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">$0<span className="text-base font-normal text-slate-400">/mo</span></div>
          
          <button disabled className="w-full py-3 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold mb-8 cursor-not-allowed">
            Included in Beta
          </button>

          <ul className="space-y-4 flex-1">
            <FeatureItem text="500 AI Generations / mo" />
            <FeatureItem text="Access to 10 Basic Agents" />
            <FeatureItem text="Export to Text" />
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 border border-indigo-500 ring-4 ring-indigo-500/20 shadow-2xl flex flex-col transform md:-translate-y-4 relative">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Current Plan</div>
          <h3 className="text-lg font-semibold text-white mb-2">Enterprise Beta</h3>
          <p className="text-slate-400 text-sm mb-6">Everything unlocked for you.</p>
          <div className="text-4xl font-bold text-white mb-6">$0<span className="text-base font-normal text-slate-400">/mo</span></div>
          
          <button className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-semibold mb-8 cursor-default flex items-center justify-center gap-2">
            <Icons.CheckCircle2 size={18} /> Active Access
          </button>

          <ul className="space-y-4 flex-1">
            <FeatureItem text="Unlimited Generations" light />
            <FeatureItem text="Access to All 14 Agents" light />
            <FeatureItem text="Advanced Workflows" light />
            <FeatureItem text="Priority Support" light />
            <FeatureItem text="Early Access Features" light />
          </ul>
        </div>

        {/* Agency Plan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col opacity-75 grayscale hover:grayscale-0 transition-all">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Agency</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">For large teams.</p>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">$0<span className="text-base font-normal text-slate-400">/mo</span></div>
          
          <button disabled className="w-full py-3 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold mb-8 cursor-not-allowed">
            Included in Beta
          </button>

          <ul className="space-y-4 flex-1">
            <FeatureItem text="Everything in Growth" />
            <FeatureItem text="API Access" />
            <FeatureItem text="Dedicated Account Manager" />
          </ul>
        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>Beta terms apply. We reserve the right to introduce pricing for future advanced features.</p>
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