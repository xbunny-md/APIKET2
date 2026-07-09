import React, { useEffect, useState } from 'react';
import { Shield, Key, Plus, Trash2, Power, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function GoogleKeyManager() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/v1/google/keys', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    
    try {
      await fetch('/api/v1/google/keys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify(data)
      });
      setShowAdd(false);
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await fetch(`/api/v1/google/keys/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'disabled' : 'active' })
      });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this key?')) return;
    try {
      await fetch(`/api/v1/google/keys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading Keys...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Google Keys</h1>
          <p className="text-neutral-400 text-sm">Manage Google Cloud API keys for YouTube and fallback providers.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="w-full md:w-auto px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Key
        </button>
      </div>

      {showAdd && (
        <motion.form 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddKey} 
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-medium mb-4">Add New Google Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Key Name</label>
              <input name="name" required placeholder="e.g. YouTube Data API Key 1" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">API Key</label>
              <input name="key" required type="password" placeholder="AIzaSy..." className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Priority (Higher is used first)</label>
              <input name="priority" type="number" defaultValue={1} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-neutral-400 hover:text-white text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">Save Key</button>
          </div>
        </motion.form>
      )}

      {keys.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl text-neutral-500">
          <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No Google Cloud keys configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keys.map((key) => (
            <div key={key._id} className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col hover:bg-white/[0.02] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${key.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{key.name}</h4>
                    <span className="text-xs text-neutral-500">Priority: {key.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(key._id, key.status)} className={`p-1.5 rounded bg-white/5 hover:bg-white/10 ${key.status === 'active' ? 'text-green-400' : 'text-neutral-400'}`}>
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteKey(key._id)} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-white/5 text-sm">
                 <div className="flex flex-col">
                   <span className="text-neutral-500 text-xs">Usage</span>
                   <span>{key.usageCount} requests</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-neutral-500 text-xs">Health</span>
                   <span className={key.healthScore > 80 ? 'text-green-400' : 'text-yellow-400'}>{key.healthScore}%</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
