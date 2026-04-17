import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Check } from 'lucide-react';

const UserSetup = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({ name });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-20 pb-10">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-3">One last <span className="text-yellow-500">Step</span></h1>
        <p className="text-zinc-500 font-medium font-inter">What should we call you?</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-yellow-600 transition-colors">
            <User size={20} />
          </div>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-lg"
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-yellow-100 transition-all active:scale-95"
        >
          <span>Start Booking</span>
          <Check size={20} />
        </button>
      </form>
    </div>
  );
};

export default UserSetup;
