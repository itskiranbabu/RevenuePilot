import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const SettingsView: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    webhookUrl: '',
    crmApiKey: '',
    emailProviderKey: '',
  });
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('revenuepilot_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    // Mock for Demo
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setProfile({ email: 'demo@revenuepilot.ai', fullName: 'Demo User' });
        return;
    }

    if (user) {
      // Fetch profile from DB
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile({
        email: user.email || '',
        fullName: data?.full_name || ''
      });
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('revenuepilot_settings', JSON.stringify(settings));
    showToast('Integration settings saved locally.', 'success');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        setTimeout(() => {
            showToast('Profile updated (Demo Mode).', 'success');
            setLoading(false);
        }, 500);
        return;
    }
    
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: profile.fullName,
      });

      if (error) {
        console.error(error);
        showToast('Failed to update profile.', 'error');
      } else {
        showToast('Profile updated successfully.', 'success');
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings & Integrations</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your profile, API keys, and connections.</p>
        </header>

        {/* Profile Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                <Icons.User size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">User Profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal details.</p>
              </div>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled 
                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 border p-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="John Doe"
                  />
                 </div>
              </div>
              <button type="submit" disabled={loading} className="text-sm bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
        </section>

        {/* Integrations Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Webhooks Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Icons.Webhook size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Webhook Integration</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Send generated content to Zapier, Make.com, or custom endpoints.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Webhook URL
                </label>
                <input
                  type="url"
                  name="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={handleSettingsChange}
                  placeholder="https://hooks.zapier.com/..."
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* CRM Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                <Icons.Database size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">CRM Integration</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Connect to HubSpot, Salesforce, or Pipedrive.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CRM API Key
                </label>
                <input
                  type="password"
                  name="crmApiKey"
                  value={settings.crmApiKey}
                  onChange={handleSettingsChange}
                  placeholder="key_..."
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

           {/* Save Button */}
           <div className="flex items-center gap-4 pt-4">
             <button
               type="submit"
               className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm flex items-center gap-2"
             >
               <Icons.Save size={18} /> Save Integration Settings
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;