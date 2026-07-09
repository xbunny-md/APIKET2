import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Key, Plus, Copy, Trash, RefreshCw, Check } from 'lucide-react';

export default function ApiKeys() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = () => {
    fetch('/api/v1/apikeys')
      .then(res => res.json())
      .then(res => {
        if (res.success) setKeys(res.data);
        setLoading(false);
      });
  };

  const createKey = () => {
    fetch('/api/v1/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New API Key' })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setNewKey(res.data.plainKey);
          fetchKeys();
        }
      });
  };

  const deleteKey = (id: string) => {
    fetch(`/api/v1/apikeys/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(res => {
        if (res.success) fetchKeys();
      });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-medium tracking-tight mb-2">API Keys</h1>
            <p className="text-neutral-400">Manage your secret keys for API access.</p>
          </div>
          <button 
            onClick={createKey}
            className="bg-white text-black px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" /> Generate New Key
          </button>
        </header>

        {newKey && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-green-400 font-medium mb-1">New API Key Generated</h3>
              <p className="text-sm text-green-500/80 mb-3">Copy this key now. You won't be able to see it again.</p>
              <div className="bg-black/50 px-4 py-3 rounded-lg font-mono text-sm border border-white/5 flex items-center gap-4">
                <span>{newKey}</span>
                <button onClick={() => copyToClipboard(newKey)} className="text-neutral-400 hover:text-white">
                  {copied === newKey ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button onClick={() => setNewKey(null)} className="text-neutral-500 hover:text-white px-4">Dismiss</button>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-white/5 border-b border-white/10 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Prefix</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Requests</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading keys...</td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No API keys found. Generate one to get started.</td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium">{k.name}</td>
                    <td className="px-6 py-4 font-mono text-neutral-400">{k.keyPrefix}••••••••</td>
                    <td className="px-6 py-4 text-neutral-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-neutral-400">{k.requestCount || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${k.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {k.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => deleteKey(k._id)} className="text-neutral-500 hover:text-red-400 transition-colors p-1">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
