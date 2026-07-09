import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Folder, Plus, Trash } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch('/api/v1/projects')
      .then(res => res.json())
      .then(res => {
        if (res.success) setProjects(res.data);
        setLoading(false);
      });
  };

  const createProject = (e: any) => {
    e.preventDefault();
    if (!name) return;
    fetch('/api/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setName('');
          setDescription('');
          fetchProjects();
        }
      });
  };

  const deleteProject = (id: string) => {
    fetch(`/api/v1/projects/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(res => {
        if (res.success) fetchProjects();
      });
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <header className="mb-12">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Projects</h1>
          <p className="text-neutral-400">Organize your API keys and usage by project.</p>
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl"></div>)}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-4 md:p-10 border border-white/10 rounded-2xl text-center text-neutral-500">
              No projects created yet.
            </div>
          ) : (
            projects.map(p => (
              <div key={p._id} className="p-6 border border-white/10 bg-white/[0.02] rounded-2xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center border border-white/5">
                    <Folder className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{p.name}</h3>
                    <p className="text-sm text-neutral-500">{p.description || 'No description'}</p>
                  </div>
                </div>
                <button onClick={() => deleteProject(p._id)} className="p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:w-96">
        <div className="p-6 border border-white/10 bg-white/[0.02] rounded-2xl">
          <h3 className="text-lg font-medium mb-6">Create Project</h3>
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Project Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
                placeholder="e.g. Production Web App"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm h-24 resize-none focus:outline-none focus:border-white/30"
                placeholder="Brief description..."
              />
            </div>
            <button type="submit" className="w-full bg-white text-black py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors">
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
