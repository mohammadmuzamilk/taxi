import React from 'react';
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
            Chardho <span className="text-yellow-400">Go</span>
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-px bg-linear-to-r from-transparent via-yellow-400/30 to-transparent mt-4 mx-auto max-w-[120px]"
          />
        </motion.div>

        {/* The Exhibition Stage */}
        <div className="relative w-full max-w-2xl h-48 flex flex-col items-center justify-center">
          
          {/* Refined Parallax Road */}
          <div className="absolute bottom-10 w-full">
             {/* Main Surface */}
             <div className="h-px w-full bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
             
             {/* Smooth Road Marking Loop */}
             <div className="absolute top-3 w-full h-[2px] overflow-hidden opacity-10">
                <motion.div 
                  className="flex w-[200%]"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                >
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex-1 flex justify-center">
                      <div className="w-16 h-full bg-white/40" />
                    </div>
                  ))}
                </motion.div>
             </div>
          </div>

          {/* The Taxi - Realistic Side Profile */}
          <motion.div
            className="relative z-20 scale-[1.3] md:scale-[1.6]"
            // No vertical animation to ensure tires stay perfectly fixed in position
          >
            {/* Soft Shadow (Grounded) */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[85%] h-2 bg-black/60 blur-md rounded-full" />

            <svg width="150" height="60" viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBDF4B" />
                  <stop offset="100%" stopColor="#EAB308" />
                </linearGradient>
                <linearGradient id="windowGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </linearGradient>
                <filter id="headlightGlow">
                   <feGaussianBlur stdDeviation="2" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main Body Chassis */}
              <path d="M12 36C12 31 22 24 42 22H105C125 24 135 31 135 36V52H12V36Z" fill="url(#bodyGradient)" />
              <path d="M42 22L55 8H92L105 22H42Z" fill="#EAB308" />
              
              {/* Windows with subtle reflection */}
              <path d="M45 20L56 10H70V20H45Z" fill="url(#windowGradient)" />
              <path d="M74 10H89L100 20H74V10Z" fill="url(#windowGradient)" />
              <path d="M45 20L56 10H60V20H45Z" fill="white" opacity="0.05" />

              {/* Headlight Glow */}
              <rect x="131" y="40" width="5" height="3" rx="1" fill="#FEF3C7" filter="url(#headlightGlow)" />
              <path d="M136 41.5L160 38V45L136 41.5Z" fill="url(#bodyGradient)" opacity="0.05" />

              {/* Taillight */}
              <rect x="12" y="40" width="3" height="5" rx="1" fill="#991B1B" />

              {/* Premium Realistic Wheels */}
              <motion.g 
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{ originX: "35px", originY: "53px" }}
              >
                <circle cx="35" cy="53" r="11" fill="#080808" />
                <circle cx="35" cy="53" r="7" fill="#121212" stroke="#222" strokeWidth="0.5" />
                <rect x="34.5" y="46" width="1" height="14" fill="#333" rx="0.5" />
                <rect x="28" y="52.5" width="14" height="1" fill="#333" rx="0.5" />
                <circle cx="35" cy="53" r="2" fill="#555" />
              </motion.g>

              <motion.g 
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{ originX: "110px", originY: "53px" }}
              >
                <circle cx="110" cy="53" r="11" fill="#080808" />
                <circle cx="110" cy="53" r="7" fill="#121212" stroke="#222" strokeWidth="0.5" />
                <rect x="109.5" y="46" width="1" height="14" fill="#333" rx="0.5" />
                <rect x="103" y="52.5" width="14" height="1" fill="#333" rx="0.5" />
                <circle cx="110" cy="53" r="2" fill="#555" />
              </motion.g>
            </svg>
          </motion.div>
        </div>

        {/* Minimal Progress Info */}
        <div className="mt-16 w-64">
           <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
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

      {/* Very Subtle Parallax Speed Elements (Unobtrusive) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-white"
            style={{ 
              top: `${15 + i * 15}%`, 
              left: '-10%', 
              width: `${Math.random() * 50 + 50}px` 
            }}
            animate={{ x: ['0vw', '110vw'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
