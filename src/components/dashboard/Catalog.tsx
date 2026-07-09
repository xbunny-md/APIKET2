import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Server, Star, ArrowRight } from 'lucide-react';

export default function Catalog({ onNavigateToDocs }: { onNavigateToDocs: (id: string) => void }) {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/catalog')
      .then(res => res.json())
      .then(res => {
        if (res.success) setApis(res.data);
        setLoading(false);
      });
  }, []);

  const filtered = apis.filter(api => api.name.toLowerCase().includes(search.toLowerCase()) || api.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-medium tracking-tight mb-2">API Catalog</h1>
            <p className="text-neutral-400">Discover and integrate powerful endpoints.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search APIs, Categories, or Tags..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(api => (
              <div key={api._id} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col h-full group cursor-pointer" onClick={() => onNavigateToDocs(api._id)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                    <Server className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-neutral-400">{api.category}</span>
                </div>
                
                <h3 className="text-lg font-medium mb-2">{api.name}</h3>
                <p className="text-sm text-neutral-400 mb-6 flex-1 line-clamp-2">{api.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {api.popularity}</span>
                    <span>{api.latency}ms</span>
                  </div>
                  <button className="text-sm font-medium text-neutral-300 hover:text-white flex items-center gap-1 transition-colors">
                    View Docs <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
