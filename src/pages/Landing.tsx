import { motion } from 'motion/react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-neutral-800">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-white to-neutral-500" />
          <span className="font-semibold tracking-tight text-xl">NEXAPI HUB</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">Log In</a>
          <a href="/register" className="text-sm bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-neutral-200 transition-colors">Start Building</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-6xl sm:text-7xl font-medium tracking-tight mb-8">
            The infrastructure <br/> for modern APIs.
          </h1>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl leading-relaxed">
            NEXAPI HUB is the premier marketplace for developers to discover, test, and integrate world-class APIs into their applications with zero friction.
          </p>
          
          <div className="flex gap-4">
            <a href="/register" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-neutral-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Create Account
            </a>
            <a href="/login" className="border border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors">
              Documentation
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-32 p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
              <h2 className="text-2xl font-medium mb-2">Build faster with NEXAPI</h2>
              <p className="text-neutral-400">Secure, scalable, and highly available architecture.</p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 text-sm text-neutral-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Systems Operational
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Global Edge Network', desc: 'Sub-millisecond latency worldwide.' },
              { title: 'Enterprise Security', desc: 'Bank-grade encryption by default.' },
              { title: 'Unlimited Scale', desc: 'Handle billions of requests effortlessly.' }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-white/5 bg-black/50">
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
