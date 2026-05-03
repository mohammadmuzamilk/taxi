import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Navigation } from 'lucide-react';

export const IncomingRequestModal = ({ 
  request, 
  distance, 
  onAccept, 
  onDecline 
}) => {
  if (!request) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-100 flex items-end" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div 
          initial={{ y: 500 }} 
          animate={{ y: 0 }} 
          exit={{ y: 500 }} 
          transition={{ type: 'spring', damping: 28, stiffness: 300 }} 
          className="relative w-full bg-zinc-900 border-t border-white/10 rounded-t-[40px] p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/30">
                <Zap size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">New Ride!</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{request.userName || 'Passenger'}</p>
                {distance != null && (
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
                    {distance < 1000 ? `${distance} m away` : `${(distance / 1000).toFixed(1)} km away`}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-yellow-400">₹{request.fare}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Est. Earnings</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-3xl p-5 mb-6 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-yellow-500/15 rounded-xl flex items-center justify-center mt-0.5">
                <MapPin size={14} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Pickup</p>
                <p className="text-sm font-bold leading-snug">{request.pickup.address}</p>
              </div>
            </div>
            <div className="ml-4 w-px h-4 bg-zinc-700" />
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center mt-0.5">
                <Navigation size={14} className="text-zinc-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Dropoff</p>
                <p className="text-sm font-bold leading-snug">{request.drop.address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onDecline} 
              className="py-5 bg-zinc-800 text-zinc-300 rounded-3xl font-black uppercase tracking-widest text-xs border border-white/5 active:scale-95"
            >
              Decline
            </button>
            <button 
              onClick={onAccept} 
              className="py-5 bg-yellow-500 text-black rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-yellow-500/25 active:scale-95"
            >
              Accept
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
