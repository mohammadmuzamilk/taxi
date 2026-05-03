import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Car, Navigation, Zap, User } from 'lucide-react';

const BottomNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-fit">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-full px-8 py-4 flex items-center space-x-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {[
          { id: 'home', icon: Car },
          { id: 'trips', icon: Navigation },
          { id: 'earnings', icon: Zap },
          { id: 'account', icon: User }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
              activeTab === tab.id ? 'text-yellow-500' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <tab.icon 
              size={22} 
              className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : ''} 
            />
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-dot" 
                className="w-1 h-1 bg-yellow-500 rounded-full"
              />
            )}
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default BottomNavigation;
