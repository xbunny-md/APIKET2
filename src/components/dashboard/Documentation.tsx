import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Copy, Check, Terminal, Search, Globe, Clock, Zap } from 'lucide-react';

export default function Documentation({ apiId }: { apiId: string | null }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('javascript');
  const [copied, setCopied] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!apiId) {
      setLoading(false);
      return;
    }
    fetch(`/api/v1/catalog/${apiId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.data);
          // Initialize params
          const initialParams: Record<string, string> = {};
          if (res.data.docs?.parameters) {
            Object.keys(res.data.docs.parameters).forEach(k => {
              initialParams[k] = '';
            });
          }
          setParams(initialParams);
        }
        setLoading(false);
      });
  }, [apiId]);

  if (!apiId) {
    return (
      <div className="p-4 md:p-10 flex flex-col items-center justify-center min-h-[60vh] text-neutral-500 text-center">
        <Terminal className="w-12 h-12 mb-4 opacity-50" />
        <p>Select an API from the Catalog to view its documentation.</p>
      </div>
    );
  }

  if (loading) return <div className="p-4 md:p-10 text-neutral-500">Loading documentation...</div>;
  if (!data || !data.api) return <div className="p-4 md:p-10 text-red-500">API not found.</div>;

  const { api, docs } = data;

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCodeExample = () => {
    let url = `https://api.nexapi.com${api.endpoint}`;
    
    // Add params to URL for GET requests
    if (docs?.method !== 'POST' && Object.keys(params).length > 0) {
      const query = new URLSearchParams(
        Object.entries(params as Record<string, string>).filter(([_, v]) => v && v.trim() !== '') as string[][]
      ).toString();
      if (query) url += `?${query}`;
    }

    if (activeTab === 'javascript') {
      return `fetch('${url}', {
  method: '${docs?.method || 'GET'}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));`;
    }
    if (activeTab === 'curl') {
      return `curl -X ${docs?.method || 'GET'} "${url}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
    }
    return '// Language not supported yet';
  };

  const runTest = async () => {
    if (!apiKey) {
      alert("Please enter your API Key to test");
      return;
    }
    setTestLoading(true);
    setTestResponse(null);
    
    const startTime = Date.now();
    try {
      let url = api.endpoint;
      let options: any = {
        method: docs?.method || 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      };

      if (docs?.method === 'POST') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(params);
      } else {
        const query = new URLSearchParams(
          Object.entries(params as Record<string, string>).filter(([_, v]) => v && v.trim() !== '') as string[][]
        ).toString();
        if (query) url += `?${query}`;
      }

      const res = await fetch(url, options);
      const result = await res.json();
      const latency = Date.now() - startTime;
      
      setTestResponse({ 
        status: res.status, 
        data: result,
        latency: latency
      });
    } catch (e: any) {
      const latency = Date.now() - startTime;
      setTestResponse({ status: 'Error', data: e.message, latency });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10">
      {/* Left Col: Docs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 w-full">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-mono font-medium ${docs?.method === 'POST' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
              {docs?.method || 'GET'}
            </span>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight truncate">{api.name}</h1>
          </div>
          <p className="text-sm md:text-base text-neutral-400 mb-6">{api.description}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 font-mono text-xs md:text-sm gap-3">
            <span className="truncate">https://api.nexapi.com{api.endpoint}</span>
            <button onClick={() => copy(`https://api.nexapi.com${api.endpoint}`, 'url')} className="text-neutral-500 hover:text-white shrink-0 self-end sm:self-auto">
              {copied === 'url' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="space-y-8 md:space-y-10">
          <section>
            <h3 className="text-base md:text-lg font-medium border-b border-white/10 pb-2 mb-4">Authentication</h3>
            <p className="text-sm text-neutral-400 mb-2">Include your API key in the Authorization header.</p>
            <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-xs md:text-sm text-neutral-300 overflow-x-auto whitespace-nowrap">
              Authorization: Bearer nx_your_api_key_here
            </div>
          </section>

          {docs?.parameters && Object.keys(docs.parameters).length > 0 && (
            <section>
              <h3 className="text-base md:text-lg font-medium border-b border-white/10 pb-2 mb-4">Parameters</h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="text-neutral-500 border-b border-white/5">
                    <tr>
                      <th className="py-2 pl-4 md:pl-0">Name</th>
                      <th className="py-2">Type</th>
                      <th className="py-2 pr-4 md:pr-0">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-300">
                    {Object.entries(docs.parameters).map(([key, val]: any) => (
                      <tr key={key} className="border-b border-white/5 last:border-0">
                        <td className="py-3 pl-4 md:pl-0 font-mono text-white text-xs md:text-sm">{key}</td>
                        <td className="py-3 text-[10px] md:text-xs text-neutral-500">{val.type || 'string'}</td>
                        <td className="py-3 pr-4 md:pr-0 text-xs md:text-sm">{val.description || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-base md:text-lg font-medium border-b border-white/10 pb-2 mb-4">Response Example</h3>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 font-mono text-xs md:text-sm text-neutral-300 overflow-x-auto">
              <pre>{JSON.stringify(docs?.responseSuccess || { success: true }, null, 2)}</pre>
            </div>
          </section>
        </div>
      </motion.div>

      {/* Right Col: Playground & Code */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full lg:w-[400px] xl:w-[500px] flex flex-col gap-6 shrink-0">
        
        {/* Code Snippets */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-white/5 border-b border-white/10 flex px-2 pt-2">
            {['javascript', 'curl'].map(lang => (
              <button 
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium uppercase tracking-wider ${activeTab === lang ? 'text-white border-b-2 border-white' : 'text-neutral-500 hover:text-white'}`}
              >
                {lang}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={() => copy(getCodeExample(), 'code')} className="p-2 text-neutral-500 hover:text-white">
              {copied === 'code' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-neutral-300 max-h-60 overflow-y-auto">
            <pre>{getCodeExample()}</pre>
          </div>
        </div>

        {/* API Tester */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-6 mb-8 md:mb-0">
          <h3 className="font-medium mb-4 flex items-center gap-2 text-sm md:text-base">
            <Play className="w-4 h-4" /> Live Tester
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] md:text-xs font-medium text-neutral-500 mb-1">API Key</label>
              <input 
                type="password" 
                placeholder="nx_..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Render Parameters dynamically */}
            {docs?.parameters && Object.keys(docs.parameters).length > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/5">
                 <label className="block text-[10px] md:text-xs font-medium text-neutral-500">Parameters</label>
                 {Object.entries(docs.parameters).map(([key, val]: any) => (
                   <div key={key}>
                     <input 
                      type="text" 
                      placeholder={`${key} (${val.type || 'string'})`}
                      value={params[key] || ''}
                      onChange={e => setParams({...params, [key]: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-white/30 font-mono"
                     />
                   </div>
                 ))}
              </div>
            )}

            <button 
              onClick={runTest}
              disabled={testLoading}
              className="w-full bg-white text-black py-2 md:py-2.5 rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {testLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                  Executing...
                </>
              ) : 'Execute Request'}
            </button>
          </div>

          {testResponse && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[10px] md:text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1 ${testResponse.status === 200 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {testResponse.status}
                  </span>
                  <span className="text-[10px] md:text-xs font-mono text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {testResponse.latency}ms
                  </span>
                  {testResponse.data?.source && (
                    <span className="text-[10px] md:text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      Provider: {testResponse.data.source}
                    </span>
                  )}
                </div>
                <button onClick={() => copy(JSON.stringify(testResponse.data, null, 2), 'response')} className="text-[10px] md:text-xs text-neutral-500 hover:text-white flex items-center gap-1">
                  {copied === 'response' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 md:p-4 font-mono text-[10px] md:text-xs text-neutral-300 max-h-60 md:max-h-96 overflow-y-auto custom-scrollbar">
                <pre className="break-all whitespace-pre-wrap">{JSON.stringify(testResponse.data, null, 2)}</pre>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
