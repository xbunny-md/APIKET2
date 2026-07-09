import { useEffect, useState } from 'react';
import { Key } from 'lucide-react';

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/keys').then(r => r.json());
    if (res.success) setKeys(res.data);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading API Keys...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">API Keys</h1>
          <p className="text-neutral-400">Global overview of generated developer keys.</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] text-neutral-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Key Prefix</th>
                <th className="px-6 py-4 font-medium">Developer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Requests</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {keys.map(key => (
                <tr key={key._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-neutral-500" />
                      <span className="font-mono text-white">{key.keyPrefix}****************</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-300">
                    {key.userId?.email || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      key.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      key.status === 'revoked' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {key.requestCount?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {keys.length === 0 && (
          <div className="p-8 text-center text-neutral-500">No API keys generated yet.</div>
        )}
      </div>
    </div>
  );
}
