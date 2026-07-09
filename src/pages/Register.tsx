import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    deviceID: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/v1/system/user/me')
      .then(res => {
        if (res.ok) {
          navigate('/dashboard');
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => setCheckingSession(false));
  }, [navigate]);

  if (checkingSession) {
    return <LoadingScreen />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Extract device hash or generate based on browser fingerprint
    const generateDeviceHash = async () => {
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
        navigator.hardwareConcurrency || 1,
        navigator.maxTouchPoints || 0
      ];
      
      const rawString = components.join('|');
      
      // Simple hash function (SHA-256 equivalent using Web Crypto API)
      const encoder = new TextEncoder();
      const data = encoder.encode(rawString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    };
    
    // Simulate reading a device ID from the file, but also attach the stable hash
    const reader = new FileReader();
    reader.onload = async (event) => {
      const stableHash = await generateDeviceHash();
      const content = event.target?.result as string;
      const extractedId = content.trim().substring(0, 64) || 'device_' + stableHash; 
      
      setFormData(prev => ({ ...prev, deviceID: extractedId }));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.deviceID) {
      setError('Please upload your device ID file to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Request failed');
      
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-neutral-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="mb-10">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Create Account</h1>
          <p className="text-neutral-400">Join NEXAPI HUB and build the future.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">First Name</label>
              <input 
                required
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Last Name</label>
              <input 
                required
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Email Address</label>
              <input 
                required
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Phone Number</label>
              <input 
                required
                type="tel"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Password</label>
              <input 
                required
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Confirm Password</label>
              <input 
                required
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm text-neutral-400">Device ID Upload (Required)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all"
            >
              <Upload className="w-8 h-8 text-neutral-400" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload Device ID file</p>
                <p className="text-xs text-neutral-500 mt-1">.txt or .key format</p>
              </div>
              {formData.deviceID && (
                <div className="mt-4 px-4 py-2 bg-green-500/10 text-green-400 rounded-md text-xs font-mono border border-green-500/20">
                  Device ID Loaded: {formData.deviceID.substring(0, 16)}...
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".txt,.key,.pem"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-4 rounded-xl hover:bg-neutral-200 transition-colors mt-8 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
          
          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account? <a href="/login" className="text-white hover:underline">Log in</a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
