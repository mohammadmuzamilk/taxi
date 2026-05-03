import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Crosshair } from 'lucide-react';
import { config } from '../../config';

// Leaflet imports
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents, useMap, CircleMarker, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom CSS for pulsing marker
const pulseMarkerStyle = `
  .user-location-pulse {
    position: relative;
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
  }
  .user-location-pulse::after {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    width: 40px;
    height: 40px;
    border: 3px solid #3b82f6;
    border-radius: 50%;
    animation: pulsate 2s ease-out infinite;
    opacity: 0;
  }
  @keyframes pulsate {
    0% { transform: scale(0.1); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;

const defaultCenter = [28.6139, 77.2090]; // New Delhi

// Inner component to capture map events and reverse geocode on drag
const MapEventHandler = ({ setSelectedAddress, setMapCenter }) => {
  const map = useMapEvents({
    dragend: () => {
      const center = map.getCenter();
      const latLng = { lat: center.lat, lng: center.lng };
      setMapCenter([center.lat, center.lng]);
      reverseGeocode(latLng, setSelectedAddress);
    },
  });
  return null;
};

// Free reverse geocoding using Nominatim (OpenStreetMap)
const reverseGeocode = async (latLng, setSelectedAddress) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latLng.lat}&lon=${latLng.lng}&format=json`,
      { 
        headers: { 
          'Accept-Language': 'en',
          'User-Agent': 'ChardhoGoApp/1.0'
        } 
      }
    );
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(',');
      setSelectedAddress(parts.slice(0, 4).join(',').trim());
    } else {
      setSelectedAddress(`${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`);
    }
  } catch {
    setSelectedAddress(`${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`);
  }
};

// Helper to programmatically fly the map to a position
const MapFlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 16, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
};

const MapSelectionOverlay = ({ 
  showMapOverlay, setShowMapOverlay, 
  mapOverlayMode = 'booking',
  setSearchValue, setIsSearching, setSelectedRide, 
  userCoords, setUserCoords,
  onUpdateUser
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('Drag the map to choose destination');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef = useRef(null);

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newCenter = [lat, lng];
          setMapCenter(newCenter);
          setFlyTarget(newCenter);
          setUserCoords?.({ lat, lng });
          reverseGeocode({ lat, lng }, setSelectedAddress);
          setIsLocating(false);
        },
        (err) => {
          setIsLocating(false);
          console.warn('[Geo Overlay] GPS Error:', err.message);
          setSelectedAddress('Could not detect location. Try on localhost or HTTPS.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      alert("Geolocation not supported by your browser.");
    }
  };

  useEffect(() => {
    if (showMapOverlay) {
      if (userCoords) {
        const target = [userCoords.lat, userCoords.lng];
        setMapCenter(target);
        setFlyTarget(target);
        reverseGeocode({ lat: userCoords.lat, lng: userCoords.lng }, setSelectedAddress);
      } else {
        handleLocateMe();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapOverlay]); 

  useEffect(() => {
    let watchId;
    if (showMapOverlay && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserCoords?.({ lat: latitude, lng: longitude });
        },
        (err) => console.warn('[Geo Watch] Error:', err.message),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [showMapOverlay, setUserCoords]);

  useEffect(() => {
    if (showMapOverlay && userCoords && !flyTarget) {
      setMapCenter([userCoords.lat, userCoords.lng]);
    }
  }, [userCoords, showMapOverlay, flyTarget]);

  const handleConfirmLocation = async () => {
    if (mapOverlayMode === 'favorite') {
      // SAVE AS FAVORITE TO BACKEND
      try {
        const token = localStorage.getItem('userToken');
        // Fetch current user first to get existing favorites
        const meRes = await fetch(`${config.AUTH_SERVICE}/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        
        let currentFavs = meData.data?.clientProfile?.favorites || [];
        if (!currentFavs.includes(selectedAddress)) {
          const updatedFavs = [selectedAddress, ...currentFavs];
          
          const saveRes = await fetch(`${config.AUTH_SERVICE}/me`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ favorites: updatedFavs })
          });
          const saveData = await saveRes.json();
          if (saveData.success && onUpdateUser) {
            onUpdateUser(saveData.data);
          } else {
            console.error('Save Favorite Failed:', saveData.error || saveData.message || saveData);
          }
        }
      } catch (err) {
        console.error('Failed to save favorite to backend:', err);
      }
      setShowMapOverlay(false);
      setIsSearching(false);
    } else {
      setSearchValue(selectedAddress);
      setIsSearching(false);
      setSelectedRide?.('prime');
      setShowMapOverlay(false);
    }
  };

  return (
    <>
      <style>{pulseMarkerStyle}</style>
      <AnimatePresence>
        {showMapOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-90 bg-zinc-950 flex flex-col overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 z-1000 p-6 pt-12 flex items-center justify-between pointer-events-none">
              <button
                onClick={() => setShowMapOverlay(false)}
                className="w-12 h-12 bg-black/60 backdrop-blur-3xl rounded-full flex items-center justify-center text-white border border-white/20 pointer-events-auto shadow-xl"
              >
                <X size={24} />
              </button>
              <div className="bg-black/60 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/20 pointer-events-auto shadow-xl">
                <p className="text-xs font-black uppercase tracking-widest text-white">
                  {mapOverlayMode === 'favorite' ? 'Save Favorite' : 'Select Dropoff'}
                </p>
              </div>
            </div>

            <div className="flex-1 relative">
              <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                />
                <MapEventHandler setSelectedAddress={setSelectedAddress} setMapCenter={setMapCenter} />
                <MapFlyTo target={flyTarget} />
                {userCoords && (
                  <Marker
                    position={[userCoords.lat, userCoords.lng]}
                    icon={L.divIcon({
                      className: 'custom-user-location-icon',
                      html: `<div class="user-location-pulse"></div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })}
                    zIndexOffset={1000}
                  />
                )}
              </MapContainer>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none z-900">
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-12 h-12 rounded-full bg-yellow-500 border-4 border-white shadow-2xl shadow-yellow-500/60 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 scale-125 blur-md"></div>
                    <div className="w-4 h-4 bg-black rounded-full shadow-inner relative z-10"></div>
                  </div>
                  <div className="w-[3px] h-8 bg-linear-to-b from-white to-zinc-400 rounded-b-full shadow-md"></div>
                </motion.div>
                <div className="w-6 h-2 bg-black/30 rounded-full blur-sm -mt-0.5"></div>
              </div>

              <button
                onClick={handleLocateMe}
                className="absolute bottom-40 right-6 w-14 h-14 bg-black/60 backdrop-blur-3xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-xl z-900"
              >
                {isLocating ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Crosshair size={24} />
                )}
              </button>
            </div>

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 150) {
                  setShowMapOverlay(false);
                }
              }}
              className="absolute bottom-0 left-0 right-0 bg-white text-black rounded-t-[40px] p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.4)] z-900"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-zinc-200 rounded-full"></div>
              <div className="flex items-center space-x-4 mb-8 mt-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shadow-inner shrink-0">
                  <Navigation size={24} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    {mapOverlayMode === 'favorite' ? 'Selected Location' : 'Drop Destination'}
                  </p>
                  <p className="text-lg font-black leading-tight tracking-tight line-clamp-2">{selectedAddress}</p>
                </div>
              </div>
              <button
                onClick={handleConfirmLocation}
                className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(0,0,0,0.2)] active:scale-95 transition-all"
              >
                {mapOverlayMode === 'favorite' ? 'Save to Favorites' : 'Confirm Destination'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MapSelectionOverlay;
