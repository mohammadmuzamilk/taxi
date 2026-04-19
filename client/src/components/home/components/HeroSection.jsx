import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, ArrowRight, X, Map, Navigation, AlertTriangle, MapPin } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true only when it is safe to call the Geolocation API.
 * Browsers block geolocation on insecure origins (plain HTTP, non-localhost).
 */
const isSecureContext = () => {
  const { protocol, hostname } = window.location;
  return protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * Reverse-geocode coordinates → human-readable address.
 * Uses the free Nominatim / OpenStreetMap API.
 *
 * PRODUCTION NOTE: Replace this with Google Maps Geocoding API or Mapbox
 * for better accuracy, rate limits, and offline support.
 *   → https://developers.google.com/maps/documentation/geocoding
 *   → https://docs.mapbox.com/api/search/geocoding/
 */
const reverseGeocode = async (lat, lng) => {
  console.log(`[Geo] Reverse geocoding: lat=${lat}, lng=${lng}`);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'Accept-Language': 'en',
          // Nominatim policy requires a custom User-Agent to avoid rate-limiting
          'User-Agent': 'ChardhoGoApp/1.0',
        },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('[Geo] Nominatim response:', data);

    if (data?.display_name) {
      // Take the first 4 meaningful parts: Street, Area/Sub-district, City, State
      return data.display_name.split(',').slice(0, 4).join(',').trim();
    }
  } catch (err) {
    console.error('[Geo] Reverse geocode failed:', err);
  }
  // Coordinate fallback — always human-readable, never throws
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

/**
 * Maps a GeolocationPositionError code to a user-facing message.
 */
const geoErrorMessage = (err) => {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Please enable location permissions in your browser settings.';
    case err.POSITION_UNAVAILABLE:
      return 'Location signal is unavailable. Try moving to an open area.';
    case err.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while fetching your location.';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const HeroSection = ({
  isSearching, setIsSearching,
  activeTab, setActiveTab,
  searchValue, setSearchValue,
  setSelectedRide,
  setShowMapOverlay,
  pickupLocation, setPickupLocation,
  setUserCoords,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null); // null | string
  const [insecureWarning, setInsecureWarning] = useState(false);

  // ── Location Logic ─────────────────────────────────────────────────────────

  /**
   * Attempt to detect the user's current location.
   * Performs an HTTPS/localhost security check first to avoid browser crashes.
   */
  const handleLocateClick = useCallback(async () => {
    setGeoError(null);

    // ① Guard: insecure origin — don't even call the API
    if (!isSecureContext()) {
      console.warn('[Geo] Blocked: Not a secure context (HTTP or non-localhost).');
      setInsecureWarning(true);
      setPickupLocation?.('');
      return;
    }

    // ② Guard: API not available
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      console.warn('[Geo] navigator.geolocation is undefined.');
      return;
    }

    setIsLocating(true);
    setInsecureWarning(false);
    console.log('[Geo] Requesting current position...');

    navigator.geolocation.getCurrentPosition(
      // ── Success ──────────────────────────────────────────────────────────
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`[Geo] GPS success — lat:${latitude}, lng:${longitude}, accuracy:${accuracy}m`);

        // Sync coordinates to parent (used by MapSelectionOverlay)
        setUserCoords?.({ lat: latitude, lng: longitude });

        // Reverse geocode → address string
        const address = await reverseGeocode(latitude, longitude);
        console.log('[Geo] Address resolved:', address);

        setPickupLocation?.(address);
        setIsLocating(false);
      },

      // ── Error ─────────────────────────────────────────────────────────────
      (err) => {
        const message = geoErrorMessage(err);
        console.warn('[Geo] GPS error:', err.code, err.message);
        setGeoError(message);
        setPickupLocation?.('');
        setIsLocating(false);
      },

      // ── Options ───────────────────────────────────────────────────────────
      {
        enableHighAccuracy: true,
        timeout: 10000,       // 10 s before TIMEOUT error
        maximumAge: 30000,    // allow cached position up to 30 s old
      }
    );
  }, [setPickupLocation, setUserCoords]);

  // Auto-detect on mount (only if no pickup is already set)
  useEffect(() => {
    if (!pickupLocation) {
      handleLocateClick();
    }
    // We deliberately skip the dep-array warning here: one-shot on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 px-6 pt-32 h-full flex flex-col">

      {/* ── Hero heading ── */}
      {!isSearching && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black mb-2 tracking-tight">Prime Travel</h1>
          <p className="text-zinc-400 font-medium">Experience the future of mobility</p>
        </motion.div>
      )}

      <div className="space-y-4">
        <motion.div
          layout
          className={`backdrop-blur-3xl bg-zinc-900/60 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl ${isSearching ? 'p-4' : 'p-6'}`}
        >

          {/* ── Insecure origin warning banner ── */}
          <AnimatePresence>
            {insecureWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3"
              >
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-300 leading-snug">
                    Location access requires HTTPS.
                  </p>
                  <p className="text-[11px] text-amber-500/80 mt-0.5">
                    Open the app at{' '}
                    <span className="font-mono font-bold">http://localhost:5173</span>{' '}
                    for GPS to work, or enter your pickup address manually below.
                  </p>
                </div>
                <button
                  onClick={() => setInsecureWarning(false)}
                  className="shrink-0 text-amber-500 hover:text-amber-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Geo error banner ── */}
          <AnimatePresence>
            {geoError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3"
              >
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-300 leading-snug flex-1">{geoError}</p>
                <button
                  onClick={() => setGeoError(null)}
                  className="shrink-0 text-red-500 hover:text-red-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Ride Now / Schedule tabs ── */}
          {!isSearching && (
            <div className="flex bg-black/40 p-1 rounded-2xl mb-6 w-fit mx-auto border border-white/5">
              <button
                onClick={() => setActiveTab('now')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'now' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500'}`}
              >
                Ride Now
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                Schedule
              </button>
            </div>
          )}

          <div className="space-y-3">

            {/* ── Pickup input ── */}
            <div className="w-full flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/5 focus-within:border-white/20 transition-all">

              {/* Pulsing dot — tap to re-detect */}
              <button
                onClick={handleLocateClick}
                disabled={isLocating}
                title="Detect my location"
                className="relative shrink-0 w-4 h-4 focus:outline-none"
              >
                <div className="w-4 h-4 bg-yellow-500 rounded-full ring-4 ring-yellow-500/20" />
                {isLocating && (
                  <div className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-60" />
                )}
              </button>

              {/* Text area */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-0.5">
                  Pickup Location
                </p>
                {isLocating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-yellow-500 rounded-full animate-spin shrink-0" />
                    <span className="text-sm font-bold text-zinc-400">Detecting location…</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => {
                      setPickupLocation?.(e.target.value);
                      setGeoError(null);
                      setInsecureWarning(false);
                    }}
                    placeholder="Enter pickup address"
                    className="w-full bg-transparent text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                )}
              </div>

              {/* "Use Current Location" icon button */}
              <button
                onClick={handleLocateClick}
                disabled={isLocating}
                title="Use current location"
                className="shrink-0 w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 hover:bg-yellow-500/20 disabled:opacity-50 transition-colors"
              >
                <Navigation size={14} />
              </button>
            </div>

            {/* ── Drop-off input ── */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="flex items-center space-x-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/10 border-dashed focus-within:border-yellow-500/50 transition-all"
            >
              <MapPin size={14} className="text-zinc-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-0.5">
                  Drop Location
                </p>
                <input
                  type="text"
                  placeholder="Where to?"
                  value={searchValue}
                  onFocus={() => setIsSearching(true)}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
              {/* Open Map picker */}
              <button
                onClick={() => setShowMapOverlay(true)}
                className={`shrink-0 p-2 rounded-xl transition-all ${isSearching ? 'bg-yellow-500 text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
              >
                <Map size={16} />
              </button>
              {isSearching && (
                <button
                  onClick={() => { setIsSearching(false); setSearchValue(''); }}
                  className="shrink-0 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </motion.div>
          </div>

          {/* ── AI Suggestions (shown while typing drop-off) ── */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 space-y-4 overflow-hidden"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-2 flex items-center justify-between">
                  <span>AI Suggestions</span>
                  <Zap size={10} className="text-yellow-500" />
                </div>
                <div className="space-y-2">
                  {[
                    { l: 'Office',   a: 'Tech Hub Phase II, Gurugram',    i: <Star size={16} /> },
                    { l: 'Gym',      a: 'Iron Muscle Fitness, RK Puram',  i: <Zap size={16} />  },
                  ].map((loc) => (
                    <motion.button
                      key={loc.l}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSearchValue(loc.a); setIsSearching(false); setSelectedRide('prime'); }}
                      className="w-full flex items-center space-x-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 text-left"
                    >
                      <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                        {loc.i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{loc.l}</p>
                        <p className="text-xs text-zinc-500 truncate">{loc.a}</p>
                      </div>
                      <ArrowRight size={16} className="text-zinc-700 shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Primary CTA ── */}
          {!isSearching && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSearching(true)}
              className="w-full mt-6 py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-yellow-500/20"
            >
              Find Best Rides
            </motion.button>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
