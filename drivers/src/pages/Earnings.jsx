import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

// eslint-disable-next-line no-unused-vars
const Earnings = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    totalTrips: 0,
    totalHours: 0,
    dailyEarnings: [0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      const token = localStorage.getItem('driverToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/drivers/earnings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
          setEarningsData({
            totalEarnings: data.data.totalEarnings || 0,
            totalTrips:    data.data.totalTrips    || 0,
            totalHours:    data.data.totalHours    || 0,
            dailyEarnings: data.data.dailyEarnings || [0, 0, 0, 0, 0, 0, 0]
          });
        } else {
          setError(data.error || 'Failed to fetch earnings.');
        }
      } catch {
        setError('Network error. Unable to fetch real-time data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  // Find max daily earning for the chart scaling
  const maxEarning = Math.max(...earningsData.dailyEarnings, 1); // minimum 1 to avoid division by zero

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="h-full bg-zinc-950 px-6 pt-16 overflow-y-auto pb-28 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter mb-2 text-white">EARNINGS</h1>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
          <Calendar size={14} className="text-yellow-500" /> This Week Overview
        </p>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-yellow-500">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Syncing data...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-xs font-bold text-red-400 leading-snug">{error}</p>
            </div>
          )}

          {/* Total Earnings Card */}
          <div className="bg-linear-to-br from-yellow-500/20 to-orange-500/5 border border-yellow-500/20 rounded-[32px] p-6 mb-6 shadow-2xl shadow-yellow-500/10 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-yellow-500/10 rotate-12">
              <Wallet size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1.5">Net Payout</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-yellow-500">₹</span>
                <span className="text-5xl font-black text-white tracking-tight">{earningsData.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 bg-zinc-950/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Available to Withdraw</span>
              </div>
            </div>
          </div>

          {/* Daily Chart */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-[32px] p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Daily Breakdown</p>
              <TrendingUp size={16} className="text-zinc-500" />
            </div>
            
            <div className="flex items-end justify-between h-40 mb-4 gap-2">
              {earningsData.dailyEarnings.map((amount, i) => {
                const heightPercent = amount === 0 ? 0 : Math.max(5, (amount / maxEarning) * 100);
                const isToday = new Date().getDay() === (i === 6 ? 0 : i + 1);
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl border border-white/10">
                      ₹{amount}
                    </div>
                    
                    <div className="w-full bg-zinc-800/50 rounded-t-xl relative overflow-hidden flex-1 flex items-end">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: `${heightPercent}%` }} 
                        transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
                        className={`w-full rounded-t-xl ${isToday ? 'bg-yellow-500' : 'bg-zinc-600'} group-hover:brightness-110 transition-all`} 
                      />
                    </div>
                    <span className={`mt-3 text-[9px] font-black uppercase ${isToday ? 'text-yellow-500' : 'text-zinc-500'}`}>{days[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform">
                <Wallet size={64} />
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Trips</p>
              <p className="text-3xl font-black text-white">{earningsData.totalTrips}</p>
            </div>
            
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform">
                <Clock size={64} />
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Clock size={16} />
              </div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Online Hours</p>
              <p className="text-3xl font-black text-white">{earningsData.totalHours}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 text-center px-4">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest leading-relaxed">
              Earnings update automatically after every completed trip. Withdrawals are processed weekly on Mondays.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Earnings;
