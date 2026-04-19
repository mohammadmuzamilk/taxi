import React from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Star, Settings } from 'lucide-react';

const BottomNavigation = ({ selectedRide, isSearching }) => {
  if (selectedRide || isSearching) return null;

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-full px-8 py-4 flex items-center space-x-10 shadow-2xl"
      >
        <div className="flex flex-col items-center space-y-1 text-yellow-500">
          <Search size={22} className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
        </div>
        <div className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-white transition-colors cursor-pointer">
          <Clock size={22} />
        </div>
        <div className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-white transition-colors cursor-pointer">
          <Star size={22} />
        </div>
        <div className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-white transition-colors cursor-pointer">
          <Settings size={22} />
        </div>
      </motion.div>
    </div>
  );
};

export default BottomNavigation;
