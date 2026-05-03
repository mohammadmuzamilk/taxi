import React, { useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { config } from '../../config';

export const SOSButton = ({ lat, lng, rideId, token }) => {
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const handleSOS = async () => {
    // Implement long press or confirm dialog for real app
    if (!window.confirm("Are you sure you want to trigger SOS? This will alert emergency contacts and authorities.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${config.NOTIFICATION}/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lat, lng, rideId })
      });
      
      if (res.ok) {
        setTriggered(true);
        setTimeout(() => setTriggered(false), 5000);
      }
    } catch (error) {
      console.error("SOS failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSOS}
      disabled={loading || triggered}
      className={`fixed bottom-24 right-4 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${
        triggered ? 'bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
      }`}
      aria-label="Emergency SOS"
    >
      {loading ? <Loader className="animate-spin" size={28} /> : 
       triggered ? <span className="font-bold text-sm px-2">Alert Sent!</span> :
       <AlertTriangle size={32} strokeWidth={2.5} />}
    </button>
  );
};
