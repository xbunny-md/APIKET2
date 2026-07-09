import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, ChevronRight, Save, X, PlusCircle, Layers } from 'lucide-react';

export default function ApiBuilder() {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApi, setEditingApi] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Endpoint states
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [editingEndpoint, setEditingEndpoint] = useState<any>(null);

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/apis').then(r => r.json());
    if (res.success) setApis(res.data);
    setLoading(false);
  };

  const handleSaveApi = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    
    if (editingApi && editingApi._id) {
      await fetch(`/api/v1/admin/apis/${editingApi._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch('/api/v1/admin/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    setShowForm(false);
    setEditingApi(null);
    fetchApis();
  };

  const handleDeleteApi = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API and all its endpoints?')) return;
    await fetch(`/api/v1/admin/apis/${id}`, { method: 'DELETE' });
    fetchApis();
  };
  
  const fetchEndpoints = async (apiId: string) => {
    const res = await fetch(`/api/v1/admin/apis/${apiId}/endpoints`).then(r => r.json());
    if (res.success) setEndpoints(res.data);
  };

  const handleSelectApi = (api: any) => {
    setEditingApi(api);
    setShowForm(false);
    setEditingEndpoint(null);
    fetchEndpoints(api._id);
  };

  const handleSaveEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    
    if (editingEndpoint && editingEndpoint._id) {
      await fetch(`/api/v1/admin/endpoints/${editingEndpoint._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch(`/api/v1/admin/apis/${editingApi._id}/endpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    setEditingEndpoint(null);
    fetchEndpoints(editingApi._id);
  };

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading APIs...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-full md:h-[calc(100vh-100px)]">
      
      {/* Sidebar: API List */}
      <div className="w-full md:w-1/3 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-[300px] md:h-full shrink-0">
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="font-medium">APIs</h2>
          <button 
            onClick={() => { setEditingApi({}); setShowForm(true); setEditingEndpoint(null); }}
            className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {apis.map(api => (
            <div 
              key={api._id}
              onClick={() => handleSelectApi(api)}
              className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${editingApi?._id === api._id && !showForm ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <div>
                <div className={`font-medium ${editingApi?._id === api._id && !showForm ? 'text-red-400' : 'text-white'}`}>{api.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{api.category} &bull; v{api.version || '1.0'}</div>
              </div>
              <ChevronRight className={`w-4 h-4 ${editingApi?._id === api._id && !showForm ? 'text-red-400' : 'text-neutral-600'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="w-full md:w-2/3 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col overflow-hidden relative flex-1 min-h-[500px] md:min-h-0">
        
        {/* API Form */}
        {showForm && (
          <div className="absolute inset-0 bg-[#050505] z-10 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">{editingApi?._id ? 'Edit API' : 'Create API'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveApi} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">API Name</label>
                  <input name="name" defaultValue={editingApi?.name} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Category</label>
                  <input name="category" defaultValue={editingApi?.category} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Description</label>
                <textarea name="description" defaultValue={editingApi?.description} required rows={3} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Version</label>
                  <input name="version" defaultValue={editingApi?.version || '1.0'} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Status</label>
                  <select name="status" defaultValue={editingApi?.status || 'active'} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none transition-colors">
                    <option value="active">Active</option>
                    <option value="beta">Beta</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                {editingApi?._id && (
                  <button type="button" onClick={() => handleDeleteApi(editingApi._id)} className="px-4 py-2 bg-neutral-900 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors border border-red-500/20">
                    Delete API
                  </button>
                )}
                <button type="submit" className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save API
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Endpoints View */}
        {!showForm && editingApi?._id ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl font-medium text-white">{editingApi.name}</h2>
                <p className="text-sm text-neutral-400 mt-1">{editingApi.description}</p>
              </div>
              <button onClick={() => setShowForm(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Endpoints</h3>
                <button 
                  onClick={() => setEditingEndpoint({})}
                  className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2 border border-red-500/20"
                >
                  <PlusCircle className="w-4 h-4" /> Add Endpoint
                </button>
              </div>

              {editingEndpoint ? (
                <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-6">
                  <form onSubmit={handleSaveEndpoint} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-neutral-400 mb-1 block">Method</label>
                        <select name="method" defaultValue={editingEndpoint.method || 'GET'} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none">
                          <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-neutral-400 mb-1 block">Route (e.g., /api/v1/tiktok/download)</label>
                        <input name="route" defaultValue={editingEndpoint.route} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Endpoint Name</label>
                      <input name="name" defaultValue={editingEndpoint.name} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Description</label>
                      <input name="description" defaultValue={editingEndpoint.description} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setEditingEndpoint(null)} className="px-3 py-1.5 text-neutral-400 hover:text-white text-sm">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 bg-white text-black rounded-lg font-medium text-sm">Save</button>
                    </div>
                  </form>
                </div>
              ) : null}

              <div className="space-y-3">
                {endpoints.length === 0 && !editingEndpoint ? (
                  <div className="text-center p-8 border border-dashed border-white/10 rounded-xl text-neutral-500">
                    No endpoints created yet.
                  </div>
                ) : (
                  endpoints.map((ep: any) => (
                    <div key={ep._id} className="group p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 
                            ep.method === 'POST' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                          }`}>{ep.method}</span>
                          <span className="font-mono text-sm text-neutral-300">{ep.route}</span>
                        </div>
                        <div className="text-sm font-medium text-white mt-2">{ep.name}</div>
                        <div className="text-xs text-neutral-500 mt-1">{ep.description}</div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingEndpoint(ep)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-neutral-400 hover:text-white">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={async () => {
                          if (confirm('Delete endpoint?')) {
                            await fetch(`/api/v1/admin/endpoints/${ep._id}`, { method: 'DELETE' });
                            fetchEndpoints(editingApi._id);
                          }
                        }} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : !showForm && (
          <div className="flex-1 flex items-center justify-center text-neutral-500 p-8 text-center">
            <div>
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Select an API from the list or create a new one to manage its endpoints.
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
