import { useState, useEffect } from 'react';
import { Settings, Server, RefreshCw, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProviderManagement() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.data || data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'degraded': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'offline': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Server className="w-4 h-4 text-neutral-500" />;
    }
  };

  const toggleProvider = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/v1/admin/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      });
      fetchProviders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2 tracking-tight">Provider Management</h1>
          <p className="text-neutral-400">Manage fallback logic, health, and configurations across all categories.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={fetchProviders} className="flex-1 md:flex-none px-4 py-2 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex-1 md:flex-none px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Add Provider
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">Loading providers...</div>
        ) : (
          providers.map((provider) => (
            <motion.div 
              key={provider._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 border border-white/10 p-4 md:p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-black/50 rounded-lg border border-white/5 shrink-0">
                  {getStatusIcon(provider.status)}
                </div>
                <div>
                  <h3 className="font-medium text-lg flex flex-wrap items-center gap-2">
                    {provider.name}
                    {!provider.enabled && (
                      <span className="text-[10px] md:text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">Disabled</span>
                    )}
                  </h3>
                  <div className="text-xs md:text-sm text-neutral-400 mt-1 flex flex-wrap items-center gap-2 md:gap-4">
                    <span>Category: {provider.category}</span>
                    <span className="hidden md:inline">•</span>
                    <span>Priority: {provider.priority}</span>
                    <span className="hidden md:inline">•</span>
                    <span>Health: {provider.healthScore}%</span>
                    <span className="hidden md:inline">•</span>
                    <span>Success: {Math.round(provider.successRate || 100)}%</span>
                    <span className="hidden md:inline">•</span>
                    <span>Latency: {Math.round(provider.latency)}ms</span>
                  </div>
                  <div className="text-[10px] md:text-xs text-neutral-500 mt-3 flex gap-2 flex-wrap max-w-2xl">
                    {provider.supportedEndpoints.map((ep: string) => (
                      <span key={ep} className="bg-black/30 px-2 py-1 rounded border border-white/5">{ep}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity mt-4 md:mt-0 w-full md:w-auto">
                <button 
                  onClick={() => toggleProvider(provider._id, provider.enabled)}
                  className="flex-1 md:flex-none px-3 py-2 md:py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  {provider.enabled ? 'Disable' : 'Enable'}
                </button>
                <button className="flex-1 md:flex-none px-3 py-2 md:py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 flex justify-center items-center gap-2">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
