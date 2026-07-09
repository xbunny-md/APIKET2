import React, { useEffect, useState } from 'react';
import { Save, Server, Shield } from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/system/config')
      .then(res => res.json())
      .then(res => {
        if (res.success) setSettings(res.data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    
    // In a real app we'd post to an admin endpoint. For demo we simulate save.
    // await fetch('/api/v1/admin/settings', { method: 'POST', body: JSON.stringify(data) });
    alert('Settings saved. (Demo mode)');
  };

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading Settings...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">System Settings</h1>
          <p className="text-neutral-400">Configure global platform behavior.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* General */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-medium flex items-center gap-2 mb-6">
            <Server className="w-5 h-5 text-neutral-400" /> General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Site Name</label>
              <input name="siteName" defaultValue={settings.siteName} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">API Version</label>
              <input name="apiVersion" defaultValue={settings.apiVersion} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Theme</label>
              <select name="theme" defaultValue={settings.theme} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none">
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Maintenance Mode</label>
              <select name="maintenanceMode" defaultValue={settings.maintenanceMode ? 'true' : 'false'} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none">
                <option value="false">Off</option>
                <option value="true">On</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-medium flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-neutral-400" /> Security & Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Registration Enabled</label>
              <select name="registrationEnabled" defaultValue={settings.registrationEnabled ? 'true' : 'false'} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Admin Path (Query Parameter)</label>
              <input name="adminPath" defaultValue={settings.adminPath || '?areyouadmin'} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
              <p className="text-[10px] text-neutral-500 mt-1">Example: ?areyouadmin</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
