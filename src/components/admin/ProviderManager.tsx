import React, { useEffect, useState } from 'react';
import { Server, Plus, Edit2, Trash2, Save, X, Activity } from 'lucide-react';

export default function ProviderManager() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<any>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/providers').then(r => r.json());
    if (res.success) setProviders(res.data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(fd.entries());
    
    // Parse
    data.priority = Number(data.priority);
    data.enabled = data.enabled === 'true';

    if (editingProvider && editingProvider._id) {
      await fetch(`/api/v1/admin/providers/${editingProvider._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch('/api/v1/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    setEditingProvider(null);
    fetchProviders();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    await fetch(`/api/v1/admin/providers/${id}`, { method: 'DELETE' });
    fetchProviders();
  };

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading Providers...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Provider Management</h1>
          <p className="text-neutral-400">Configure backend data sources and prioritize routing.</p>
        </div>
        {!editingProvider && (
          <button 
            onClick={() => setEditingProvider({ enabled: true, priority: 1 })}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Provider
          </button>
        )}
      </div>

      {editingProvider && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">{editingProvider._id ? 'Edit Provider' : 'Add Provider'}</h2>
            <button onClick={() => setEditingProvider(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Provider Name</label>
                <input name="name" defaultValue={editingProvider.name} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Category / API Assignment</label>
                <input name="category" defaultValue={editingProvider.category} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Priority (Lower = Higher Priority)</label>
                <input name="priority" type="number" defaultValue={editingProvider.priority} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Status</label>
                <select name="enabled" defaultValue={editingProvider.enabled ? 'true' : 'false'} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button type="button" onClick={() => setEditingProvider(null)} className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Provider
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="md:hidden grid grid-cols-1 gap-6">
        {providers.map(provider => (
          <div key={provider._id} className={`p-6 rounded-2xl border ${provider.enabled ? 'border-white/10 bg-black/40' : 'border-red-500/20 bg-red-500/5'} transition-colors`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Server className="w-4 h-4" /> {provider.name}
                </h3>
                <div className="text-xs text-neutral-500 mt-1">{provider.category} &bull; Priority: {provider.priority}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditingProvider(provider)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(provider._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3 mt-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${provider.enabled ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {provider.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Health Score</span>
                <span className="text-white">{provider.healthScore || 100}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Avg Latency</span>
                <span className="text-white">{Math.round(provider.latency || 0)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Success Rate</span>
                <span className="text-white">{Math.round(provider.successRate ?? 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto border border-white/10 rounded-2xl bg-black/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 text-sm">
              <th className="p-4 font-medium">Provider Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Health</th>
              <th className="p-4 font-medium">Latency</th>
              <th className="p-4 font-medium">Success</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {providers.map(provider => (
              <tr key={provider._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4 font-medium flex items-center gap-2">
                  <Server className="w-4 h-4 text-neutral-500" /> {provider.name}
                </td>
                <td className="p-4 text-neutral-300">{provider.category}</td>
                <td className="p-4 text-neutral-300">{provider.priority}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${provider.enabled ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {provider.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 text-neutral-300">{provider.healthScore || 100}%</td>
                <td className="p-4 text-neutral-300">{Math.round(provider.latency || 0)}ms</td>
                <td className="p-4 text-neutral-300">{Math.round(provider.successRate ?? 100)}%</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingProvider(provider)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(provider._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
