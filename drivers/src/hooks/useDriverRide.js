import { useState } from 'react';
import { API_BASE } from '../utils/socket';

// eslint-disable-next-line no-unused-vars
export const useDriverRide = (token, user) => {
  const [activeRide, setActiveRide] = useState(null);
  const [status, setStatus] = useState('idle');
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [trackingLink, setTrackingLink] = useState(null);

  const acceptRide = async (request, driverPos) => {
    try {
      const res = await fetch(`${API_BASE}/api/drivers/accept-ride`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          rideId: request.rideId,
          driverPos: { lat: driverPos[0], lng: driverPos[1] }
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveRide(data.data);
        setStatus('accepted');
        return true;
      }
    } catch (err) {
      console.error('Failed to accept ride', err);
    }
    return false;
  };

  const updateRideStatus = async (newStatus) => {
    if (!activeRide) return;
    try {
      const res = await fetch(`${API_BASE}/api/drivers/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          rideId: activeRide.rideId || activeRide.id,
          status: newStatus 
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus(newStatus);
        if (newStatus === 'completed') {
          setActiveRide(null);
          setStatus('idle');
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
    return false;
  };

  return {
    activeRide,
    setActiveRide,
    status,
    setStatus,
    showOtpOverlay,
    setShowOtpOverlay,
    trackingLink,
    setTrackingLink,
    acceptRide,
    updateRideStatus
  };
};
