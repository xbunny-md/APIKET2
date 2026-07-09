import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import LoadingScreen from '../components/LoadingScreen';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [adminPath, setAdminPath] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminInput, setAdminInput] = useState('');

  useEffect(() => {
    // Check config for admin path
    fetch('/api/v1/system/config')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setAdminPath(res.data.adminPath);
        }
      })
      .catch(() => {});

    // Check session
    fetch('/api/v1/system/user/me')
      .then(res => {
        if (res.ok) {
          window.location.href = '/dashboard';
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => setCheckingSession(false));
  }, []);

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      setShowAdminInput(true);
      setClickCount(0);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminInput === adminPath.replace('?', '')) {
      navigate(`/login?${adminInput}`);
    } else {
      setShowAdminInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Generate stable device hash
      const components = [
        navigator.userAgent, navigator.language, screen.colorDepth,
        screen.width + 'x' + screen.height, new Date().getTimezoneOffset(),
        !!window.sessionStorage, !!window.localStorage,
        navigator.hardwareConcurrency || 1, navigator.maxTouchPoints || 0
      ];
      const rawString = components.join('|');
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(rawString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const deviceHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceHash, userAgent: navigator.userAgent })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Request failed');
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return <LoadingScreen />;
  }

  if (adminPath && location.search === adminPath) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-neutral-800">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="mb-10 text-center relative z-10">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-white to-neutral-500 mx-auto mb-6" />
          <h1 
            onClick={handleTitleClick}
            className="text-2xl font-medium tracking-tight mb-2 select-none cursor-default"
          >
            Welcome Back
          </h1>
          <p className="text-neutral-400 text-sm">Log in to your NEXAPI HUB dashboard.</p>
        </div>

        {showAdminInput && (
          <form onSubmit={handleAdminSubmit} className="mb-6 relative z-10">
            <input 
              autoFocus
              type="password"
              placeholder="System Access Key"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neutral-600 text-sm"
              value={adminInput}
              onChange={e => setAdminInput(e.target.value)}
            />
          </form>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3 mb-8 relative z-10">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Email Address</label>
            <input 
              required
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Password</label>
            <input 
              required
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-neutral-200 transition-colors mt-8 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          <p className="text-center text-sm text-neutral-500 mt-6">
            New to NEXAPI? <a href="/register" className="text-white hover:underline">Create an account</a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
