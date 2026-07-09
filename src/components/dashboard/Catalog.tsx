import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Server, Star, ArrowRight, Copy, Play, CheckCircle2, Check } from 'lucide-react';

export default function Catalog({ onNavigateToDocs }: { onNavigateToDocs: (id: string) => void }) {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copied, setCopied] = useState<string | null>(null);

  const categories = ['All', 'AI', 'Downloader', 'Media', 'Upload', 'Image', 'Video', 'Audio', 'Anime', 'Social', 'Google', 'Utility', 'Security', 'Data', 'Web'];

  useEffect(() => {
    fetch('/api/v1/catalog')
      .then(res => res.json())
      .then(res => {
        if (res.success) setApis(res.data);
        setLoading(false);
      });
  }, []);

  const filtered = apis.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(search.toLowerCase()) || api.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || api.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

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

        {/* Categories row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(api => (
              <div key={api._id} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                    <Server className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3 h-3" /> {api.status || 'Active'}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-neutral-400">{api.category}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-2">{api.name}</h3>
                <p className="text-sm text-neutral-400 mb-6 flex-1 line-clamp-2">{api.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mb-4">
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {api.popularity}</span>
                    <span>{api.latency}ms</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(`https://api.nexapi.com${api.endpoint}`);
                      setCopied(api._id);
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copied === api._id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === api._id ? 'Copied' : 'Copy Endpoint'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onNavigateToDocs(api._id)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Documentation
                  </button>
                  <button 
                    onClick={() => onNavigateToDocs(api._id)}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" fill="currentColor" /> Try API
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
