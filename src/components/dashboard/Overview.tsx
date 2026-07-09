import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, ArrowUpRight, Server, Shield } from 'lucide-react';

export default function Overview() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/analytics/summary')
      .then(res => res.json())
      .then(res => {
        if (res.success) setSummary(res.data);
      });
  }, []);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <header className="mb-12">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Platform Overview</h1>
          <p className="text-neutral-400">Monitor your integration health and quota usage.</p>
        </header>

        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Requests', value: summary.totalRequests.toLocaleString() },
              { label: "Today's Requests", value: summary.todayRequests.toLocaleString() },
              { label: 'Remaining Requests', value: summary.remainingRequests.toLocaleString() },
              { label: 'Active API Keys', value: summary.activeKeys.toString() },
              { label: 'Success Rate', value: `${summary.successRate}%` },
              { label: 'Error Rate', value: `${summary.errorRate}%` },
              { label: 'Current Plan', value: summary.currentPlan }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col justify-between">
                <div className="text-sm text-neutral-400 mb-4">{stat.label}</div>
                <div className="text-3xl font-medium tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
            <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
            <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
            <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
