import React, { useState } from 'react';
import { Share2, MapPin, Navigation, Car, Shield, PhoneCall } from 'lucide-react';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';

export const ActiveRideCard = ({ ride, token }) => {
  const [showOtp, setShowOtp] = useState(false);
  
  // Custom hook for tracking the driver's live location
  const { driverLocation: _driverLocation } = useTrackingSocket(token, 'client', ride.id);

  const handleShareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Track My Ride',
        text: `I'm riding with ChardhoGo. Track my live location here:`,
        url: ride.trackingLink || window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="absolute bottom-6 left-6 right-6 z-40">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Driver Info Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center overflow-hidden">
               {/* Driver photo would go here, fallback to icon */}
               <Car size={28} className="text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">{ride.driver?.name || 'Driver Assigned'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-md">{ride.driver?.vehiclePlate || 'XX-00-0000'}</span>
                <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">⭐ {ride.driver?.rating || '5.0'}</span>
              </div>
            </div>
          </div>
          
          <button className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <PhoneCall size={20} />
          </button>
        </div>

        {/* OTP Section (Only if ride is ACCEPTED but not started) */}
        {ride.status === 'accepted' && (
          <div className="bg-black/50 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">Give PIN to driver</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-widest">{showOtp ? ride.otp || '1234' : '••••'}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowOtp(!showOtp)}
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 underline"
            >
              {showOtp ? 'Hide' : 'Show'}
            </button>
          </div>
        )}

        {/* Live Distance / Status */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</p>
            <p className="text-sm font-black text-emerald-400 capitalize">{ride.status}</p>
          </div>
          
          <button 
            onClick={handleShareTracking}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-zinc-700 transition-colors"
          >
            <Share2 size={14} /> Share Status
          </button>
        </div>

      </div>
    </div>
  );
};
