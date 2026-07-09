import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Database, Server, Settings as SettingsIcon, Users, Activity, Layers, ActivitySquare, AlertTriangle, Play, Book, Key } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

// Admin Components (To be built)
import AdminOverview from '../components/admin/AdminOverview';
import ApiBuilder from '../components/admin/ApiBuilder';
import ProviderManager from '../components/admin/ProviderManager';
import GoogleKeyManager from '../components/admin/GoogleKeyManager';
import PlanManager from '../components/admin/PlanManager';
import UserManager from '../components/admin/UserManager';
import ApiKeyManager from '../components/admin/ApiKeyManager';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import Announcements from '../components/admin/Announcements';
import SystemSettings from '../components/admin/SystemSettings';
import AuditLogs from '../components/admin/AuditLogs';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the query parameter is ?areyouadmin
    if (location.search !== '?areyouadmin') {
      navigate('/');
      return;
    }
    
    // Simulate setting up admin session or just proceed
    // We bypass standard authentication as requested
    setLoading(false);
  }, [location, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  const navItems = [
    { name: 'Overview', icon: ActivitySquare },
    { name: 'API Builder', icon: Layers },
    { name: 'Provider Manager', icon: Server },
    { name: 'Google Keys', icon: Key },
    { name: 'Plan Management', icon: Book },
    { name: 'User Management', icon: Users },
    { name: 'API Keys', icon: Database },
    { name: 'Analytics', icon: Activity },
    { name: 'Announcements', icon: AlertTriangle },
    { name: 'Audit Logs', icon: Play },
    { name: 'System Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <AdminOverview />;
      case 'API Builder': return <ApiBuilder />;
      case 'Provider Manager': return <ProviderManager />;
      case 'Google Keys': return <GoogleKeyManager />;
      case 'Plan Management': return <PlanManager />;
      case 'User Management': return <UserManager />;
      case 'API Keys': return <ApiKeyManager />;
      case 'Analytics': return <AdminAnalytics />;
      case 'Announcements': return <Announcements />;
      case 'System Settings': return <SystemSettings />;
      case 'Audit Logs': return <AuditLogs />;
      default: return <div>Section under construction</div>;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white selection:bg-neutral-800 flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r border-red-500/20 flex-col h-screen sticky top-0 bg-black/50 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3 mb-4 shrink-0">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]">A</div>
          <span className="font-semibold tracking-tight text-lg text-red-400">ADMIN CONTROL</span>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          {navItems.map((item) => (
            <div 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`px-3 py-2.5 rounded-lg flex items-center gap-3 font-medium text-sm transition-colors cursor-pointer ${
                activeTab === item.name 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.name}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-red-500/20 shrink-0 bg-black/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center font-bold text-xs text-white">A</div>
          <span className="font-semibold tracking-tight text-red-400">ADMIN</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden h-[calc(100dvh-60px-60px)] md:h-screen bg-[#050505] relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="pb-24 md:pb-0 min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Nav - Only show primary items to save space */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] bg-black/90 backdrop-blur-xl border-t border-red-500/20 z-20 px-2 grid grid-cols-4 gap-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.slice(0, 4).map((item) => (
          <div
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors cursor-pointer ${
              activeTab === item.name
                ? 'text-red-400' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'fill-red-500/20' : ''}`} />
            <span className="text-[10px] font-medium truncate w-full text-center px-1">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
