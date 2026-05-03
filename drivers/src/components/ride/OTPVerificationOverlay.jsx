import React, { useState } from 'react';
import { ShieldCheck, Loader } from 'lucide-react';

export const OTPVerificationOverlay = ({ rideId, token, onVerified, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    setLoading(true);
    setError(null);
    
    try {
      const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;
      const res = await fetch(`${GATEWAY_URL}/api/rides/v2/${rideId}/start-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      
      const data = await res.json();
      if (data.success) {
        onVerified(data.trackingLink);
      } else {
        setError(data.error || 'Invalid OTP. Please ask the passenger.');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-[32px] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
          <ShieldCheck size={32} className="text-black" />
        </div>
        
        <h2 className="text-2xl font-black italic uppercase tracking-tight mb-2 text-center">Verify Passenger</h2>
        <p className="text-zinc-400 text-sm font-medium text-center mb-8">
          Ask the passenger for the 4-digit PIN to start the trip.
        </p>

        <input 
          type="number"
          placeholder="0000"
          maxLength={4}
          className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-center text-4xl font-black tracking-[0.5em] text-yellow-500 mb-4 outline-none focus:border-yellow-500/50 transition-colors"
          value={otp}
          onChange={(e) => setOtp(e.target.value.slice(0, 4))}
        />

        {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest text-center mb-4">{error}</p>}

        <div className="flex gap-4 w-full mt-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-zinc-800 text-zinc-300 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={handleVerify}
            disabled={loading || otp.length !== 4}
            className="flex-1 py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader className="animate-spin mx-auto" size={16} /> : 'Start Trip'}
          </button>
        </div>
      </div>
    </div>
  );
};
