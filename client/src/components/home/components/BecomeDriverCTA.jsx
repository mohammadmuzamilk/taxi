import React from 'react';
import { motion } from 'framer-motion';
import { Car, ChevronRight, DollarSign } from 'lucide-react';

const BecomeDriverCTA = ({ onJoin }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 mx-6 p-6 bg-linear-to-br from-zinc-900 to-black border border-white/10 rounded-[32px] overflow-hidden relative group"
    >
      {/* Decorative background circle */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-700" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center space-x-2 text-yellow-500 mb-2">
            <DollarSign size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Earn with us</span>
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight leading-tight">
            Turn your car into <br />
            <span className="text-yellow-500">Extra Income</span>
          </h3>
          <p className="text-zinc-500 text-xs font-medium mb-4 max-w-[200px]">
            Join 1,000+ partners earning on their own schedule.
          </p>
          
          <button
            onClick={onJoin}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20"
          >
            <span>Join as Driver</span>
            <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="w-24 h-24 bg-white/5 rounded-[24px] flex items-center justify-center border border-white/10 shadow-2xl">
          <Car size={48} className="text-zinc-700 group-hover:text-yellow-500 transition-colors duration-500" />
        </div>
      </div>
    </motion.div>
  );
};

export default BecomeDriverCTA;
