import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] overflow-hidden font-sans">
      {/* Background: Soft Cinematic Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#050505] to-[#0d0d0d]" />
      
      {/* Subtle Ambient Light (Luxury Feel) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full px-6">
        
        {/* Typography: Bold, Modern, Refined */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 w-24 h-24 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 p-1 bg-zinc-900"
        >
          <img src="/pwa-192x192.png" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mb-20 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1 italic uppercase">
            Chardho <span className="text-yellow-400">Go</span>
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-px bg-linear-to-r from-transparent via-yellow-400/30 to-transparent mt-4 mx-auto max-w-[120px]"
          />
        </motion.div>

        {/* Minimal Progress Info */}
        <div className="w-64">
           <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
              />
           </div>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.8, duration: 1 }}
             className="mt-6 text-center text-[10px] text-zinc-600 tracking-[0.2em] uppercase font-bold"
           >
             Initializing Secure Services
           </motion.p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
