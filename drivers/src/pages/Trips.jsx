import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Calendar, CheckCircle2, AlertCircle, Loader2, ChevronRight, Car } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

const Ticket = ({ ride }) => {
  const isCompleted = ride.status === 'completed';
  // eslint-disable-next-line no-unused-vars
  const isPending = !isCompleted && ride.status !== 'cancelled';
  
  const statusColors = {
    completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
    ongoing: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    accepted: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    searching: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    arrived: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  };

  const statusColor = statusColors[ride.status] || statusColors.searching;
  const date = new Date(ride.createdAt).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative mb-5"
    >
      {/* Ticket Body */}
      <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden shadow-2xl relative">
        
        {/* Ticket Header */}
        <div className="px-5 py-4 border-b border-dashed border-white/10 flex justify-between items-center bg-zinc-800/20">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{date}</span>
          </div>
          <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusColor}`}>
            {isCompleted ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            <span className="text-[9px] font-black uppercase tracking-widest">{ride.status}</span>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              {/* Route timeline */}
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-zinc-800" />
                
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Pickup</p>
                  <p className="text-xs font-bold text-white truncate pr-2">{ride.pickup?.address || 'Unknown'}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Dropoff</p>
                  <p className="text-xs font-bold text-white truncate pr-2">{ride.drop?.address || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Fare & Distance */}
            <div className="text-right flex flex-col justify-between h-full">
              <div>
                <p className="text-2xl font-black text-yellow-400">₹{ride.fare || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">Net Fare</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="bg-zinc-800/50 rounded-xl py-2 px-3 flex items-center gap-2">
              <Navigation size={12} className="text-zinc-400" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Distance</p>
                <p className="text-xs font-bold text-zinc-300">{ride.distance || '--'}</p>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl py-2 px-3 flex items-center gap-2">
              <Clock size={12} className="text-zinc-400" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Duration</p>
                <p className="text-xs font-bold text-zinc-300">{ride.duration || '--'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Ticket Cutouts (Perforated effect) */}
        <div className="absolute -left-3 top-12 w-6 h-6 rounded-full bg-zinc-950 border-r border-white/10" />
        <div className="absolute -right-3 top-12 w-6 h-6 rounded-full bg-zinc-950 border-l border-white/10" />
      </div>
    </motion.div>
  );
};

// eslint-disable-next-line no-unused-vars
const Trips = ({ user }) => {
  const [activeTab, setActiveTab] = useState('completed');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      const token = localStorage.getItem('driverToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/drivers/trips`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
          setRides(data.data || []);
        } else {
          setError(data.error || 'Failed to fetch trips.');
        }
      } catch {
        setError('Network error. Unable to fetch trips.');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const completedRides = rides.filter(r => r.status === 'completed');
  const pendingRides = rides.filter(r => r.status !== 'completed' && r.status !== 'cancelled');

  const displayRides = activeTab === 'completed' ? completedRides : pendingRides;

  return (
    <div className="h-full bg-zinc-950 px-6 pt-16 overflow-y-auto pb-28 relative">
      <div className="mb-6">
        <h1 className="text-3xl font-black italic tracking-tighter mb-2 text-white">TRIP HISTORY</h1>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
          {rides.length} Total Rides
        </p>
      </div>

      {/* Custom Tabs */}
      <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5 mb-6">
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'completed' 
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Completed ({completedRides.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'pending' 
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Pending ({pendingRides.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-yellow-500">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Loading trips...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400 leading-snug">{error}</p>
        </div>
      ) : displayRides.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {displayRides.map((ride, idx) => (
              <Ticket key={ride._id || idx} ride={ride} />
            ))}
          </AnimatePresence>
          
          <div className="py-6 text-center">
            <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
              <Car size={12} /> No more trips to show
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-zinc-900/30 rounded-[32px] border border-white/5 border-dashed">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <Navigation size={24} className="text-zinc-600" />
          </div>
          <p className="text-sm font-bold text-zinc-400 mb-2">No {activeTab} trips found</p>
          <p className="text-xs text-zinc-600">
            {activeTab === 'completed' 
              ? "When you complete a ride, it will appear here." 
              : "You don't have any ongoing or pending rides right now."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Trips;
