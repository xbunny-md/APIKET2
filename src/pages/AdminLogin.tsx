import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Request failed');
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
      >
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-white/10 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-2xl font-medium text-center mb-2">Restricted Access</h1>
        <p className="text-neutral-400 text-center text-sm mb-8">System Administrator Login</p>
        
        {error && (
          <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg mb-6 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors font-mono"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
}
