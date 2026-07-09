import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/analytics/charts')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          // Format for recharts
          const formatted = res.data.map((item: any) => ({
            date: item._id,
            requests: item.requests,
            errors: item.errors
          }));
          setData(formatted);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <header className="mb-12">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Usage Analytics</h1>
          <p className="text-neutral-400">Monitor your API request volume and performance.</p>
        </header>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-lg font-medium mb-6">7-Day Request Volume</h2>
          
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="w-full h-full bg-white/5 rounded-lg animate-pulse" />
            ) : data.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">No data available for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#333" tick={{fill: '#888', fontSize: 12}} dy={10} />
                  <YAxis stroke="#333" tick={{fill: '#888', fontSize: 12}} dx={-10} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#ffffff" fillOpacity={1} fill="url(#colorReq)" name="Successful Requests" />
                  <Area type="monotone" dataKey="errors" stroke="#ef4444" fillOpacity={1} fill="url(#colorErr)" name="Errors" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
