import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';

const SchedulingOverlay = ({ isScheduling, setIsScheduling, setActiveTab }) => {
  return (
    <AnimatePresence>
      {isScheduling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-60 backdrop-blur-3xl bg-black/60 flex items-center justify-center p-6"
        >
           <motion.div
             initial={{ scale: 0.9, y: 20 }}
             animate={{ scale: 1, y: 0 }}
             className="w-full bg-zinc-900 border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden relative"
           >
              <button onClick={() => setIsScheduling(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-400">
                <X size={20} />
              </button>

              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Schedule Ride</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Arrival Time</p>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                 {/* Mock Calendar */}
                 <div className="flex justify-between overflow-x-auto pb-4 scrollbar-hide space-x-4">
                    {['Mon 18', 'Tue 19', 'Wed 20', 'Thu 21', 'Fri 22'].map((d, i) => (
                      <div key={i} className={`shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${i === 1 ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-white/5 border-white/5 text-zinc-400'}`}>
                         <p className="text-[10px] font-black uppercase tracking-tighter">{d.split(' ')[0]}</p>
                         <p className="text-xl font-black">{d.split(' ')[1]}</p>
                      </div>
                    ))}
                 </div>

                 {/* Mock Time Picker */}
                 <div className="grid grid-cols-2 gap-3">
                    {['09:00 AM', '12:30 PM', '06:15 PM', '09:00 PM'].map((t, i) => (
                      <div key={i} className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${i === 2 ? 'bg-white/10 border-yellow-500/50 text-white' : 'bg-white/5 border-white/5 text-zinc-500'}`}>
                         {t}
                      </div>
                    ))}
                 </div>
              </div>

              <button 
                onClick={() => { setIsScheduling(false); setActiveTab('schedule'); }}
                className="w-full mt-10 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-sm"
              >
                Set Schedule
              </button>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SchedulingOverlay;
