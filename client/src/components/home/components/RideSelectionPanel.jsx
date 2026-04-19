import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard } from 'lucide-react';

const RideSelectionPanel = ({ selectedRide, setSelectedRide, handleConfirmRide, rideTypes }) => {
  return (
    <AnimatePresence>
      {selectedRide !== null && (
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          className="absolute bottom-0 left-0 right-0 z-40 p-6 pt-0"
        >
          <div className="backdrop-blur-3xl bg-zinc-900/90 border border-white/10 rounded-t-[40px] p-6 shadow-2xl relative">
            {/* Grabber */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-800 rounded-full"></div>
            
            <div className="flex items-center justify-between mt-4 mb-8">
              <h3 className="text-xl font-black tracking-tight">Select Premium</h3>
              <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
                 <button className="px-4 py-1.5 bg-yellow-500 text-black rounded-full text-[10px] font-black uppercase tracking-tighter">Budget</button>
                 <button className="px-4 py-1.5 text-zinc-500 rounded-full text-[10px] font-black uppercase tracking-tighter">Elite</button>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {rideTypes.map((ride) => (
                <motion.div
                  key={ride.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRide(ride.id)}
                  className={`relative flex items-center space-x-4 p-5 rounded-3xl cursor-pointer transition-all border ${
                    selectedRide === ride.id 
                      ? 'bg-white/10 border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.1)]' 
                      : 'bg-white/5 border-transparent'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ride.color} ${ride.id === 'black' ? 'text-white border border-white/10' : 'text-black'}`}>
                    {ride.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                       <h4 className="font-black text-sm uppercase tracking-tight">{ride.name}</h4>
                       <span className="text-[10px] font-bold text-yellow-500 px-1.5 py-0.5 bg-yellow-500/10 rounded-lg whitespace-nowrap">{ride.eta}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">Luxury sedan, top rated</p>
                  </div>
                  <div className="text-right">
                     <p className="font-black text-lg leading-none">{ride.price}</p>
                     <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Instant</p>
                  </div>
                  {selectedRide === ride.id && (
                    <motion.div layoutId="selection-ring" className="absolute inset-0 border-2 border-yellow-500 rounded-3xl" />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button className="w-16 h-16 bg-zinc-800 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                 <CreditCard size={18} className="text-zinc-400 mb-1" />
                 <span className="text-[8px] font-bold text-zinc-500 uppercase">.... 4242</span>
              </button>
              <button 
                onClick={handleConfirmRide}
                className="flex-1 h-16 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(250,204,21,0.3)] transition-all active:scale-95"
              >
                Confirm Ride
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RideSelectionPanel;
