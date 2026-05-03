import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  Navigation, User, Star, MapPin, 
  Phone, Power, Zap, Clock, Wallet 
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const DEFAULT_CENTER = [28.6139, 77.2090]; // New Delhi

const RecenterMap = ({ position }) => {
  const map = useMap();
  React.useEffect(() => {
    if (position && position[0] && position[1]) {
      try {
        const currentZoom = map.getZoom() || 16;
        map.flyTo(position, currentZoom, { duration: 1 });
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Fallback if map isn't fully initialized
        map.setView(position, 16);
      }
    }
  }, [position, map]);
  return null;
};

const Home = ({ 
  isOnline, toggleOnline, user, driverPos, mapCenter, 
  activeRide, status, updateRideStatus, setShowOtpOverlay 
}) => {
  // Ensure we always have a valid initial center to prevent Leaflet "Set map center and zoom first" error
  const initialCenter = mapCenter || driverPos || DEFAULT_CENTER;

  return (
    <div className="h-full relative overflow-hidden bg-zinc-950">
      {/* ── Background Map ── */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <MapContainer 
          center={initialCenter} 
          zoom={16} 
          style={{ width: '100%', height: '100%', background: '#09090b' }} 
          zoomControl={false} 
          attributionControl={false}
        >
          <TileLayer url={DARK_TILE} attribution={TILE_ATTR} />
          <RecenterMap position={driverPos} />
          {driverPos && (
            <>
              <CircleMarker center={driverPos} radius={28} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1 }} />
              <CircleMarker center={driverPos} radius={10} pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }} />
            </>
          )}
        </MapContainer>
        {/* Subtle Gradients for Legibility */}
        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <div className="relative z-10 px-6 pt-12 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
              <Zap size={20} />
            </div>
          </div>
          
          <motion.button 
            onClick={toggleOnline}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full border flex items-center space-x-3 transition-all duration-500 ${
              isOnline 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-zinc-900/80 border-white/5 text-zinc-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isOnline ? 'Active' : 'Offline'}</span>
          </motion.button>

          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-2">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
              <Navigation size={20} />
            </div>
          </div>
        </div>

        {/* Quick Stats Over Map */}
        <div className="flex space-x-3">
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-2.5 flex items-center space-x-3">
            <Wallet size={14} className="text-yellow-500" />
            <div>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Today</p>
              <p className="text-sm font-black italic tracking-tighter">₹450</p>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-2.5 flex items-center space-x-3">
            <Clock size={14} className="text-blue-400" />
            <div>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Active</p>
              <p className="text-sm font-black italic tracking-tighter">3.2h</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Content Panel ── */}
      <div className="absolute bottom-32 left-6 right-6 z-10">
        {!activeRide ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="backdrop-blur-3xl bg-zinc-900/60 border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden relative"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap size={120} />
            </div>

            <div className="flex items-center space-x-4 mb-6 relative">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                <User size={32} className="text-zinc-500" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">{user?.name || 'Driver'}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-black">{user?.rating || '5.0'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{user?.vehicle?.model || 'Car'}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={toggleOnline}
              className={`w-full py-5 rounded-2xl flex items-center justify-center space-x-4 transition-all duration-500 ${
                isOnline 
                  ? 'bg-zinc-800 text-white border border-white/5' 
                  : 'bg-white text-black shadow-[0_15px_30px_rgba(255,255,255,0.1)]'
              }`}
            >
              <Power size={20} strokeWidth={3} />
              <span className="text-sm font-black uppercase tracking-widest">
                {isOnline ? 'Stop Earning' : 'Start Earning'}
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="backdrop-blur-3xl bg-black/70 border border-white/10 rounded-[32px] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Trip</p>
                  <p className="font-bold text-sm truncate max-w-[150px]">{activeRide.drop.address}</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <p className="text-emerald-400 font-black text-lg italic">₹{activeRide.fare}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-6 bg-white/5 rounded-2xl p-4">
              <div className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center font-black text-xl text-white">
                {activeRide.user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-black text-white">{activeRide.user.name}</p>
                <p className="text-xs text-zinc-500 font-bold">{activeRide.user.phone}</p>
              </div>
              <button className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/10">
                <Phone size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {status === 'picking_up' && (
                <button onClick={() => updateRideStatus('arrived')} className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-yellow-500/20">
                  I Have Arrived
                </button>
              )}
              {status === 'arrived' && (
                <button onClick={() => setShowOtpOverlay(true)} className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20">
                  Start Trip
                </button>
              )}
              {status === 'ongoing' && (
                <button onClick={() => updateRideStatus('completed')} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs">
                  Complete Trip
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;
