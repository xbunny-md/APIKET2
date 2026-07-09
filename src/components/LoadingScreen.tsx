import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border border-white/20 border-t-white"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-white/40 to-white/80 blur-[2px]" />
            <div className="absolute w-4 h-4 rounded bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <motion.h2 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg font-medium tracking-tight"
          >
            Authenticating Session
          </motion.h2>
          <p className="text-neutral-500 text-sm font-mono flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Connecting to NEXAPI Core
          </p>
        </div>
      </motion.div>
    </div>
  );
}
