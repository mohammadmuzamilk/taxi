import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { MapPin, Navigation2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

const LocationTracker = () => {
  const { location, error, isLoading, permissionState, startTracking } = useGeolocation();
  const { latitude, longitude, accuracy, address } = location;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl shadow-zinc-200/50 p-5 w-full max-w-sm mx-auto border border-zinc-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg text-zinc-900 flex items-center space-x-2">
          <Navigation2 size={20} className="text-yellow-500" />
          <span>GPS Status</span>
        </h3>
        
        {isLoading ? (
          <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            <Loader2 size={12} className="animate-spin mr-1" />
            Tracking
          </span>
        ) : error ? (
          <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <AlertCircle size={12} className="mr-1" />
            Error
          </span>
        ) : (
          <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
            Active
          </span>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-xl mb-4">
          <p className="text-sm font-medium text-red-800 leading-tight mb-3">
            {error}
          </p>
          <button 
            onClick={startTracking}
            className="flex items-center justify-center space-x-2 w-full py-2.5 bg-white text-red-700 text-sm font-bold rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : isLoading && !latitude ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur animate-ping opacity-50" />
            <div className="relative bg-yellow-500 text-white p-3 rounded-full">
              <MapPin size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm font-bold text-zinc-500 animate-pulse">Acquiring Satellites...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Latitude</p>
              <p className="text-sm font-bold text-zinc-900">{latitude?.toFixed(6) || '--'}</p>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Longitude</p>
              <p className="text-sm font-bold text-zinc-900">{longitude?.toFixed(6) || '--'}</p>
            </div>
          </div>

          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Accuracy</p>
              <p className="text-sm font-bold text-zinc-900">
                {accuracy ? `Within ${accuracy} meters` : '--'}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              accuracy <= 20 ? 'bg-green-100 text-green-600' : 
              accuracy <= 100 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
            }`}>
              <Navigation2 size={16} />
            </div>
          </div>

          <div className="bg-zinc-900 p-3.5 rounded-xl flex items-start space-x-3">
            <MapPin size={16} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-zinc-300 leading-relaxed line-clamp-2">
              {address || 'Translating coordinates to address...'}
            </p>
          </div>
        </div>
      )}

      {permissionState === 'denied' && (
        <p className="mt-4 text-xs text-center text-zinc-500 font-medium">
          Note: You must allow location access in your browser settings to use this feature.
        </p>
      )}
    </motion.div>
  );
};

export default LocationTracker;
