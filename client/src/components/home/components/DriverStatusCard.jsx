import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Star } from 'lucide-react';

const DriverStatusCard = ({ rideStatus, currentRide }) => {
  return (
    <AnimatePresence>
      {(rideStatus === 'accepted' || rideStatus === 'arriving') && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-10 left-6 right-6 z-80 backdrop-blur-3xl bg-zinc-900/95 border border-white/10 rounded-[32px] p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
             <div>
                <h2 className="text-xl font-bold tracking-tight text-white">{rideStatus === 'accepted' ? 'Driver Matched' : 'Driver Arriving'}</h2>
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">ETA: 4 Mins</p>
             </div>
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-lg">
                <Car size={24} />
             </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center font-bold">
                {currentRide?.driver?.name?.charAt(0) || 'D'}
             </div>
             <div className="flex-1">
                <p className="font-bold text-white">{currentRide?.driver?.name || 'Vipul Kumar'}</p>
                <p className="text-xs text-zinc-500">White Tesla Model 3 • UP-16-AX-4829</p>
             </div>
             <button className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black">
                <Star size={18} />
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <button className="py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs">Call Driver</button>
             <button className="py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5">Chat</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DriverStatusCard;
