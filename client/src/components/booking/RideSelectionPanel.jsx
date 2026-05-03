import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, User, Star, Navigation, ChevronLeft } from 'lucide-react';

const RideSelectionPanel = ({ selectedRide, setSelectedRide, handleConfirmRide, rideTypes, nearbyDrivers }) => {
  const onConfirm = () => {
    handleConfirmRide(null); // No specific driver selected by user
  };

  return (
    <AnimatePresence>
      {selectedRide !== null && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(e, info) => {
            if (info.offset.y > 150) {
              setSelectedRide(null);
            }
          }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
        >
          <div className="backdrop-blur-3xl bg-zinc-900/95 border border-white/10 rounded-[40px] shadow-2xl relative max-h-[85vh] flex flex-col overflow-hidden">
            {/* Grabber */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full z-10"></div>
            
            <div className="p-6 pt-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedRide(null)}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-xl font-black tracking-tight">Select Vehicle</h3>
                </div>
                <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
                   {['car', 'auto', 'bike'].map(type => (
                     <button 
                      key={type}
                      onClick={() => {
                        setSelectedRide(type);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                        selectedRide === type ? 'bg-yellow-500 text-black' : 'text-zinc-500'
                      }`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {rideTypes.filter(r => r.id === selectedRide).map((ride) => (
                  <div
                    key={ride.id}
                    className="relative flex items-center space-x-4 p-5 rounded-3xl bg-white/10 border border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.1)]"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ride.color} text-black`}>
                      {ride.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                         <h4 className="font-black text-sm uppercase tracking-tight">{ride.name}</h4>
                         <span className="text-[10px] font-bold text-yellow-500 px-1.5 py-0.5 bg-yellow-500/10 rounded-lg whitespace-nowrap">{ride.eta}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">Top rated {selectedRide}s nearby</p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-lg leading-none">{ride.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nearby Drivers Section (Read Only) */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center">
                  <Navigation size={12} className="mr-1" /> Nearby Online Drivers
                </h4>
                <div className="space-y-2">
                  {nearbyDrivers.length > 0 ? (
                    nearbyDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                            <User size={20} className="text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{driver.name}</p>
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center text-[10px] text-yellow-500 font-bold">
                                <Star size={10} className="fill-yellow-500 mr-0.5" /> {driver.rating}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-medium">• {driver.vehicleModel}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-400 uppercase">{driver.vehiclePlate}</p>
                          {driver.distance !== null && (
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter mt-1">
                              {driver.distance < 1000 ? `${driver.distance}m away` : `${(driver.distance / 1000).toFixed(1)}km`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <p className="text-xs text-zinc-500 font-medium">Searching for {selectedRide}s within 500m...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2">
                <button 
                  onClick={onConfirm}
                  className="w-full h-16 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
                >
                  Request Ride
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RideSelectionPanel;
