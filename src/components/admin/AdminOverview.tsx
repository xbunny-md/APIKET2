import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Key, Database, Activity, Server, AlertTriangle } from 'lucide-react';

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/admin/analytics/overview')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      });
  }, []);

  const stats = data ? [
    { label: 'Total Users', value: data.totalUsers, icon: Users },
    { label: 'Active API Keys', value: data.activeApiKeys, icon: Key },
    { label: 'Total APIs', value: data.totalApis, icon: Database },
    { label: 'Today\'s Requests', value: data.todayRequests, icon: Activity },
  ] : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-medium tracking-tight mb-2">Platform Overview</h1>
        <p className="text-neutral-400">High-level metrics and system health for NEXAPI HUB.</p>
      </header>

      {data ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-neutral-400">{stat.label}</div>
                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-medium tracking-tight">{stat.value}</div>
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 w-full bg-white/5 rounded-2xl"></div>)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <h2 className="text-lg font-medium flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-neutral-400" /> System Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg border border-white/5">
              <span className="text-sm text-neutral-400">API Gateway</span>
              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Operational</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg border border-white/5">
              <span className="text-sm text-neutral-400">Database (MongoDB)</span>
              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Operational</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg border border-white/5">
              <span className="text-sm text-neutral-400">Provider Health</span>
              {data?.degradedProviders === 0 ? (
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Operational</span>
              ) : (
                <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">
                  {data?.degradedProviders} Degraded
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <h2 className="text-lg font-medium flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-neutral-400" /> Recent Alerts
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start p-3 bg-black/50 rounded-lg border border-white/5">
              <div>
                <div className="text-sm font-medium">New User Registration</div>
                <div className="text-xs text-neutral-500 mt-1">A new developer joined the platform.</div>
              </div>
              <span className="text-xs text-neutral-500">2m ago</span>
            </div>
            <div className="flex justify-between items-start p-3 bg-black/50 rounded-lg border border-white/5">
              <div>
                <div className="text-sm font-medium">TikTok Provider Timeout</div>
                <div className="text-xs text-neutral-500 mt-1">Provider took &gt; 5000ms to respond.</div>
              </div>
              <span className="text-xs text-neutral-500">1h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
