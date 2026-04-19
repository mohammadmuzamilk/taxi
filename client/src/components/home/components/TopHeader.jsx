import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell } from 'lucide-react';

const TopHeader = ({ user, onLogout }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 px-6 pt-12 pb-6 flex items-center justify-between">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center space-x-3 backdrop-blur-xl bg-white/5 p-2 pr-4 rounded-full border border-white/10"
      >
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
          <Menu size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-tighter uppercase italic">CHARDHO GO</h2>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-3"
      >
        <button className="w-11 h-11 backdrop-blur-xl bg-white/5 rounded-full flex items-center justify-center text-white border border-white/10 relative">
          <Bell size={18} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-yellow-500 rounded-full ring-4 ring-zinc-950"></span>
        </button>
        <button onClick={onLogout} className="w-11 h-11 bg-white text-zinc-950 rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-white/5">
          {user?.name?.charAt(0) || 'U'}
        </button>
      </motion.div>
    </div>
  );
};

export default TopHeader;
