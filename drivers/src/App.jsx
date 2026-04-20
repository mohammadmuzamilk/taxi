import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, MapPin, Navigation, Phone, 
  User, Power, Star, 
  X, Menu
} from 'lucide-react';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;
const socket = io(API_URL, { path: '/api/rides/socket.io' });

// ─── Haversine Distance (metres) ────────────────────────────────────────────
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Map Re-center helper ────────────────────────────────────────────────────
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, map.getZoom(), { duration: 1 });
  }, [position, map]);
  return null;
};

// ─── Lightning bolt SVG (Zap) ────────────────────────────────────────────────
const Zap = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ─── Dark map tile style ─────────────────────────────────────────────────────
const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const DEFAULT_POS = [28.6139, 77.2090]; // fallback: New Delhi

// ============================================================================
function App() {
  const [isOnline, setIsOnline]           = useState(false);
  const [activeRide, setActiveRide]       = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [status, setStatus]               = useState('idle');
  const [driverPos, setDriverPos]         = useState(null); // [lat, lng]
  const [distanceToUser, setDistanceToUser] = useState(null); // metres

  const watchIdRef = useRef(null);

  const driverData = {
    userId: 'drv_99',
    name: 'Vipul Kumar',
    vehicle: 'White Tesla Model 3',
    rating: 4.9,
    trips: 1240,
  };

  // ── Continuous GPS tracking ────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverPos([pos.coords.latitude, pos.coords.longitude]);
        // Broadcast live position to backend/users
        if (isOnline) {
          socket.emit('driver_location_update', {
            driverId: driverData.userId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isOnline]);

  // ── Incoming ride request filter (500–800 m radius) ────────────────────────
  useEffect(() => {
    const handler = (data) => {
      if (!isOnline || activeRide) return;

      const pickupLat = data?.pickup?.lat;
      const pickupLng = data?.pickup?.lng;

      // If driver GPS is known, check proximity
      if (driverPos && pickupLat != null && pickupLng != null) {
        const dist = haversineDistance(
          driverPos[0], driverPos[1],
          pickupLat, pickupLng
        );
        setDistanceToUser(Math.round(dist));
        // Only accept requests where pickup is within 800 m of driver
        if (dist <= 800) {
          setIncomingRequest(data);
        }
        // else silently ignore — out of range
      } else {
        // GPS not yet acquired — accept all requests (graceful fallback)
        setIncomingRequest(data);
      }
    };

    socket.on('new_ride_available', handler);
    return () => socket.off('new_ride_available', handler);
  }, [isOnline, activeRide, driverPos]);

  // ── Toggle online / offline ────────────────────────────────────────────────
  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    if (next) socket.emit('driver_online', driverData);
  };

  // ── Accept ride ────────────────────────────────────────────────────────────
  const acceptRide = async () => {
    const rideId = incomingRequest.rideId;
    try {
      await fetch(`${API_URL}/api/rides/${rideId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', driver: driverData }),
      });
      socket.emit('accept_ride', { rideId, driverData });
      setActiveRide(incomingRequest);
      setIncomingRequest(null);
      setStatus('picking_up');
    } catch (err) {
      console.error('Accept Error:', err);
    }
  };

  // ── Update ride status ─────────────────────────────────────────────────────
  const updateRideStatus = (newStatus) => {
    setStatus(newStatus);
    socket.emit('status_update', { rideId: activeRide.rideId, status: newStatus });
    if (newStatus === 'completed') {
      setActiveRide(null);
      setStatus('idle');
      setDistanceToUser(null);
    }
  };

  const mapCenter = driverPos || DEFAULT_POS;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-inter overflow-hidden">

      {/* ── Full-screen OpenStreetMap (dark) ─────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={16}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={DARK_TILE} attribution={TILE_ATTR} />
          <RecenterMap position={driverPos} />

          {/* Driver "You are here" blue dot */}
          {driverPos && (
            <>
              {/* Accuracy ring */}
              <CircleMarker
                center={driverPos}
                radius={28}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1 }}
              />
              {/* Core dot */}
              <CircleMarker
                center={driverPos}
                radius={10}
                pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}
              />
            </>
          )}
        </MapContainer>

        {/* Dark gradient overlays for readability */}
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* ── Top Status Bar ────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 bg-black/50 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs font-black uppercase tracking-widest">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="bg-black/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10">
          <h1 className="text-sm font-black italic tracking-tighter">DRIVER HUB</h1>
        </div>

        <button className="w-10 h-10 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center">
          <Menu size={16} />
        </button>
      </div>

      {/* ── GPS badge ─────────────────────────────────────────────────────── */}
      {driverPos && (
        <div className="relative z-10 mx-6 mt-2">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/5 flex items-center space-x-2 w-fit">
            <Navigation size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {driverPos[0].toFixed(4)}, {driverPos[1].toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* ── Idle / Stats panel (no active ride) ──────────────────────────── */}
      {!activeRide && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-36 left-6 right-6 z-10"
        >
          {/* Profile card */}
          <div className="backdrop-blur-3xl bg-black/60 border border-white/10 rounded-[28px] p-5 flex items-center space-x-4 mb-4 shadow-xl">
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center relative border border-white/10 shrink-0">
              <div className="absolute inset-0 bg-linear-to-br from-yellow-500/20 to-transparent" />
              <User size={28} className="text-zinc-400 relative z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black tracking-tight truncate">{driverData.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-yellow-500 text-xs font-bold">
                  <Star size={12} fill="currentColor" />
                  <span>{driverData.rating}</span>
                </div>
                <span className="text-zinc-600">•</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{driverData.trips} Trips</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Today</p>
              <p className="text-xl font-black text-yellow-400">₹2,480</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Active Ride Controls ──────────────────────────────────────────── */}
      {activeRide && (
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-36 left-6 right-6 z-10 backdrop-blur-3xl bg-black/70 border border-white/10 rounded-[32px] p-6 shadow-2xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Destination</p>
              <p className="font-bold text-sm truncate">{activeRide.drop.address}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-2 bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center font-black text-lg shrink-0">
              {activeRide.user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{activeRide.user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{activeRide.user.phone}</p>
            </div>
            <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <Phone size={15} />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {status === 'picking_up' && (
              <button onClick={() => updateRideStatus('arrived')}
                className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-yellow-500/20">
                I Have Arrived
              </button>
            )}
            {status === 'arrived' && (
              <button onClick={() => updateRideStatus('ongoing')}
                className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/20">
                Start Trip
              </button>
            )}
            {status === 'ongoing' && (
              <button onClick={() => updateRideStatus('completed')}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm">
                Complete Trip
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Go Online / Offline Button ───────────────────────────────────── */}
      {!activeRide && (
        <div className="absolute bottom-10 left-6 right-6 z-10">
          <button
            onClick={toggleOnline}
            className={`w-full py-5 rounded-[28px] flex items-center justify-center space-x-4 transition-all duration-500 shadow-2xl ${
              isOnline
                ? 'bg-black/70 backdrop-blur-xl border border-white/10 text-white'
                : 'bg-white text-zinc-950'
            }`}
          >
            <div className={`p-2 rounded-full ${isOnline ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-600'}`}>
              <Power size={22} />
            </div>
            <span className="text-base font-black uppercase tracking-widest">
              {isOnline ? 'Go Offline' : 'Go Online'}
            </span>
          </button>
        </div>
      )}

      {/* ── Incoming Ride Request Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {incomingRequest && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <motion.div
              initial={{ y: 500 }}
              animate={{ y: 0 }}
              exit={{ y: 500 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-zinc-900 border-t border-white/10 rounded-t-[40px] p-8 shadow-[0_-20px_80px_rgba(250,204,21,0.15)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/30">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">New Ride!</h2>
                    {distanceToUser != null && (
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                        {distanceToUser < 1000 
                          ? `${distanceToUser} m away`
                          : `${(distanceToUser / 1000).toFixed(1)} km away`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-yellow-400">₹{incomingRequest.fare}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Est. Earnings</p>
                </div>
              </div>

              {/* Route Details */}
              <div className="bg-black/40 border border-white/5 rounded-3xl p-5 mb-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500/15 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} className="text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Pickup</p>
                    <p className="text-sm font-bold text-white leading-snug">{incomingRequest.pickup.address}</p>
                  </div>
                </div>

                <div className="ml-4 w-px h-4 bg-zinc-700" />

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation size={14} className="text-zinc-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Dropoff</p>
                    <p className="text-sm font-bold text-white leading-snug">{incomingRequest.drop.address}</p>
                  </div>
                </div>
              </div>

              {/* Distance & range badge */}
              {distanceToUser != null && distanceToUser <= 500 && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                  <p className="text-xs font-bold text-emerald-400">Very close — within 500 m of pickup!</p>
                </div>
              )}

              {/* Accept / Decline */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setIncomingRequest(null); setDistanceToUser(null); }}
                  className="py-5 bg-zinc-800 text-zinc-300 rounded-3xl font-black uppercase tracking-widest text-xs border border-white/5 active:scale-95 transition-transform"
                >
                  Decline
                </button>
                <button
                  onClick={acceptRide}
                  className="py-5 bg-yellow-500 text-black rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-yellow-500/25 active:scale-95 transition-transform"
                >
                  Accept
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
