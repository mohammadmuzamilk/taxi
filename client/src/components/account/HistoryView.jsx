import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, ChevronRight, Navigation, CheckCircle2, XCircle } from 'lucide-react';

const HistoryView = () => {
  const history = [
    { id: 1, date: 'Today, 2:30 PM', price: '₹250', from: 'Tech Hub Phase II', to: 'Iron Muscle Fitness', status: 'Completed', type: 'Premium Car' },
    { id: 2, date: 'Yesterday, 9:15 AM', price: '₹150', from: 'Home', to: 'Tech Hub Phase II', status: 'Completed', type: 'Fast Bike' },
    { id: 3, date: '28 Apr, 8:40 PM', price: '₹0', from: 'Airport T3', to: 'Home', status: 'Cancelled', type: 'Premium Car' },
    { id: 4, date: '25 Apr, 10:00 AM', price: '₹320', from: 'Central Mall', to: 'Home', status: 'Completed', type: 'Auto Rickshaw' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-40 bg-zinc-950 pt-32 px-6 overflow-y-auto pb-40"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Your Rides</h1>
        <p className="text-zinc-400 font-medium">View your recent trips and activity</p>
      </div>

      <div className="space-y-4">
        {history.map((ride) => (
          <motion.div
            key={ride.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{ride.date}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">{ride.price}</span>
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-zinc-300 uppercase tracking-widest">{ride.type}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {ride.status === 'Completed' ? (
                  <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{ride.status}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
                    <XCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{ride.status}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative pl-6 space-y-4">
              {/* Timeline line */}
              <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-white/10 rounded-full" />
              
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-yellow-500 ring-4 ring-yellow-500/20" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Pickup</p>
                <p className="text-sm font-bold truncate">{ride.from}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-white ring-4 ring-white/10" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Drop-off</p>
                <p className="text-sm font-bold truncate">{ride.to}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HistoryView;
