import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X, BookOpen, Check } from 'lucide-react';

export default function PlanManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/plans').then(r => r.json());
    if (res.success) setPlans(res.data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(fd.entries());
    
    // Parse numbers
    ['dailyQuota', 'weeklyQuota', 'monthlyQuota', 'requestsPerMinute', 'maxApiKeys', 'maxProjects', 'price'].forEach(key => {
      if (data[key]) data[key] = Number(data[key]);
    });

    if (editingPlan && editingPlan._id) {
      await fetch(`/api/v1/admin/plans/${editingPlan._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch('/api/v1/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    setEditingPlan(null);
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    await fetch(`/api/v1/admin/plans/${id}`, { method: 'DELETE' });
    fetchPlans();
  };

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading Plans...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Plan Management</h1>
          <p className="text-neutral-400">Configure subscription tiers and usage quotas.</p>
        </div>
        {!editingPlan && (
          <button 
            onClick={() => setEditingPlan({})}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> Create Plan
          </button>
        )}
      </div>

      {editingPlan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">{editingPlan._id ? 'Edit Plan' : 'Create Plan'}</h2>
            <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Plan Name</label>
                <input name="name" defaultValue={editingPlan.name} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" placeholder="e.g. Developer, Enterprise" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-neutral-400 mb-1 block">Price</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingPlan.price || 0} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
                <div className="w-24">
                  <label className="text-xs text-neutral-400 mb-1 block">Currency</label>
                  <input name="currency" defaultValue={editingPlan.currency || 'USD'} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="font-medium mb-4">Quotas & Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Daily Quota</label>
                  <input name="dailyQuota" type="number" defaultValue={editingPlan.dailyQuota || 1000} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Weekly Quota</label>
                  <input name="weeklyQuota" type="number" defaultValue={editingPlan.weeklyQuota || 7000} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Monthly Quota</label>
                  <input name="monthlyQuota" type="number" defaultValue={editingPlan.monthlyQuota || 30000} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Requests per Minute</label>
                  <input name="requestsPerMinute" type="number" defaultValue={editingPlan.requestsPerMinute || 60} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Requests per Second</label>
                  <input name="requestsPerSecond" type="number" defaultValue={editingPlan.requestsPerSecond || 5} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Max API Keys</label>
                  <input name="maxApiKeys" type="number" defaultValue={editingPlan.maxApiKeys || 1} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Max Projects</label>
                  <input name="maxProjects" type="number" defaultValue={editingPlan.maxProjects || 1} required className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button type="button" onClick={() => setEditingPlan(null)} className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Plan
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full text-center p-12 border border-dashed border-white/10 rounded-2xl text-neutral-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No plans created yet. Start by creating a Free or Starter plan.</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className="p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/[0.02] transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium">{plan.name}</h3>
                  <div className="text-3xl font-bold mt-2">
                    {plan.price === 0 ? 'Free' : `${plan.price} ${plan.currency}`}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingPlan(plan)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(plan._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 mt-6 flex-1">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> {plan.monthlyQuota.toLocaleString()} requests/month
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> {plan.requestsPerMinute.toLocaleString()} requests/minute
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> {plan.requestsPerSecond?.toLocaleString() || 5} requests/second
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> Up to {plan.maxProjects} projects
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> Up to {plan.maxApiKeys} API keys
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
