import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Car, CircleUser, ArrowRight } from 'lucide-react';

const RoleSelection = ({ onSelect }) => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 px-6 pt-20 pb-10">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-3">How would you like to <span className="text-yellow-500">Go</span>?</h1>
        <p className="text-zinc-500 font-medium">Choose your primary account type</p>
      </div>

      <div className="flex flex-col space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('user')}
          className="relative group flex items-start p-6 bg-white border border-zinc-100 rounded-3xl text-left shadow-sm hover:shadow-xl hover:border-yellow-200 transition-all overflow-hidden"
        >
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-4 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
            <Car size={28} />
          </div>
          <div className="ml-5 flex-1 pt-1">
            <h3 className="text-xl font-bold mb-1 group-hover:text-zinc-900">Book a Ride</h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">Quick rides anywhere, anytime. Fast, safe, and reliable.</p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 group-hover:text-yellow-500 group-hover:translate-x-2 transition-all">
            <ArrowRight size={24} />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('driver')}
          className="relative group flex items-start p-6 bg-white border border-zinc-100 rounded-3xl text-left shadow-sm hover:shadow-xl hover:border-yellow-200 transition-all overflow-hidden"
        >
          <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600 mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
            <CircleUser size={28} />
          </div>
          <div className="ml-5 flex-1 pt-1">
            <h3 className="text-xl font-bold mb-1">Drive & Earn</h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">Earn money with your vehicle. Freedom to work on your schedule.</p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-2 transition-all">
            <ArrowRight size={24} />
          </div>
        </motion.button>
      </div>

      <div className="mt-auto text-center">
        <p className="text-sm text-zinc-400 font-medium italic">You can always switch roles later in settings.</p>
      </div>
    </div>
  );
};

export default RoleSelection;
