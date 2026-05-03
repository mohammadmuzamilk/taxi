import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Search, Clock, Star, Settings } from 'lucide-react';

const BottomNavigation = ({ selectedRide, isSearching, activeView, setActiveView }) => {
  if (selectedRide || isSearching) return null;

  const navItems = [
    { id: 'home', icon: Search },
    { id: 'history', icon: Clock },
    { id: 'favorites', icon: Star },
    { id: 'settings', icon: Settings }
  ];

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-full px-8 py-4 flex items-center space-x-10 shadow-2xl"
      >
        {navItems.map(({ id, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <div 
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex flex-col items-center space-y-1 cursor-pointer transition-colors ${isActive ? 'text-yellow-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : ''} />
              {isActive && <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNavigation;
