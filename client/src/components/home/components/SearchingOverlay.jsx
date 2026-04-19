import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from 'lucide-react';

const SearchingOverlay = ({ rideStatus, setRideStatus }) => {
  return (
    <AnimatePresence>
      {rideStatus === 'searching' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-70 backdrop-blur-3xl bg-black/80 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="relative mb-12">
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-yellow-500">
               <Navigation size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-4 text-white uppercase italic">Searching for Pilots</h1>
          <p className="text-zinc-500 font-medium max-w-[250px] leading-relaxed">Connecting you with the nearest premium vehicle in your area...</p>
          
          <button 
            onClick={() => setRideStatus('idle')}
            className="mt-16 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400"
          >
            Cancel Search
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchingOverlay;
