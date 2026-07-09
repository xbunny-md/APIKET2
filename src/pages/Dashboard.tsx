import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Key, Database, Book, BarChart, HardDrive, Settings as SettingsIcon, LifeBuoy, Heart, Clock, Folder, Server } from 'lucide-react';
import Overview from '../components/dashboard/Overview';
import ApiKeys from '../components/dashboard/ApiKeys';
import Catalog from '../components/dashboard/Catalog';
import Documentation from '../components/dashboard/Documentation';
import Analytics from '../components/dashboard/Analytics';
import Projects from '../components/dashboard/Projects';
import LoadingScreen from '../components/LoadingScreen';
import Settings from '../components/dashboard/Settings';

import ProviderManagement from '../components/dashboard/ProviderManagement';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/system/user/me')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setUser(data.data || data);
        setLoading(false);
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const navigateToDocs = (apiId: string) => {
    setSelectedApiId(apiId);
    setActiveTab('Documentation');
  };

  const navItems = [
    { name: 'Overview', icon: Activity },
    { name: 'API Keys', icon: Key },
    { name: 'API Catalog', icon: Database },
    { name: 'Documentation', icon: Book },
    { name: 'Analytics', icon: BarChart },
    { name: 'Projects', icon: Folder },
    { name: 'Favorites', icon: Heart },
    { name: 'Recent Requests', icon: Clock },
    { name: 'Provider Management', icon: Server },
    { name: 'Usage & Quota', icon: HardDrive },
    { name: 'Settings', icon: SettingsIcon },
    { name: 'Support', icon: LifeBuoy },
  ];

  const bottomNavItems = [
    { name: 'Overview', icon: Activity },
    { name: 'API Keys', icon: Key },
    { name: 'API Catalog', icon: Database },
    { name: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <Overview />;
      case 'API Keys': return <ApiKeys />;
      case 'API Catalog': return <Catalog onNavigateToDocs={navigateToDocs} />;
      case 'Documentation': return <Documentation apiId={selectedApiId} />;
      case 'Analytics': return <Analytics />;
      case 'Projects': return <Projects />;
      case 'Settings': return <Settings />;
      case 'Provider Management': return <ProviderManagement />;
      default: return <div>Section under construction</div>;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white selection:bg-neutral-800 flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r border-white/10 flex-col h-screen sticky top-0 bg-black/50 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3 mb-4 shrink-0">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-white to-neutral-500" />
          <span className="font-semibold tracking-tight text-lg">NEXAPI HUB</span>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          {navItems.map((item) => (
            <div 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`px-3 py-2.5 rounded-lg flex items-center gap-3 font-medium text-sm transition-colors cursor-pointer ${
                activeTab === item.name 
                  ? 'bg-white text-black' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.name}
            </div>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/10 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-medium">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="truncate">
            <div className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-neutral-500 truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-black/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-white to-neutral-500" />
          <span className="font-semibold tracking-tight">NEXAPI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-medium text-sm">
            {user?.firstName?.[0] || 'U'}
          </div>
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

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] bg-black/90 backdrop-blur-xl border-t border-white/10 z-20 px-2 flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {bottomNavItems.map((item) => (
          <div
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors cursor-pointer ${
              activeTab === item.name || (activeTab === 'Documentation' && item.name === 'API Catalog')
                ? 'text-white' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'fill-white/20' : ''}`} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
