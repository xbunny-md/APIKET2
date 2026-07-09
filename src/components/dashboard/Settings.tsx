import { motion } from 'motion/react';
import { User, Lock, Phone, Mail, Palette, Bell, Target, Shield, LayoutGrid, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Settings() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/system/user/me')
      .then(res => res.json())
      .then(data => setUser(data.data || data))
      .catch(() => {});
  }, []);

  const sections = [
    {
      title: "Profile Settings",
      icon: User,
      items: [
        { label: "Full Name", value: user ? `${user.firstName} ${user.lastName}` : "Loading...", icon: User },
        { label: "Email Address", value: user?.email || "Loading...", icon: Mail },
        { label: "Phone Number", value: "Add phone number", icon: Phone, isAction: true },
        { label: "Password", value: "Change password", icon: Lock, isAction: true }
      ]
    },
    {
      title: "Preferences",
      icon: Palette,
      items: [
        { label: "Theme", value: "Dark (Default)", icon: Palette },
        { label: "Notifications", value: "Enabled", icon: Bell },
        { label: "Default Layout", value: "Grid View", icon: LayoutGrid }
      ]
    },
    {
      title: "Quota & Limits",
      icon: Target,
      items: [
        { label: "Daily Quota", value: "10,000 requests" },
        { label: "Weekly Quota", value: "70,000 requests" },
        { label: "Monthly Quota", value: "300,000 requests" }
      ]
    },
    {
      title: "Security & Developer",
      icon: Shield,
      items: [
        { label: "Active Sessions", value: "1 Device", icon: Cpu },
        { label: "API Preferences", value: "Standard Routing" },
        { label: "Developer Options", value: "Disabled", isAction: true }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Settings</h1>
        <p className="text-neutral-400 text-sm">Manage your account preferences and API limits.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
              <section.icon className="w-4 h-4 text-neutral-400" />
              <h2 className="font-medium text-sm">{section.title}</h2>
            </div>
            <div className="divide-y divide-white/5">
              {section.items.map((item) => (
                <div key={item.label} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className="w-4 h-4 text-neutral-500" />}
                    <span className="text-sm text-neutral-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${item.isAction ? 'text-blue-400 cursor-pointer hover:text-blue-300' : 'text-neutral-500'}`}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
