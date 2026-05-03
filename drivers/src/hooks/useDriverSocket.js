import { useState, useEffect } from 'react';
import { socket } from '../utils/socket';
import { haversineDistance } from '../utils/geo';

export const useDriverSocket = (user, token, driverPos) => {
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [distanceToUser, setDistanceToUser] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!user || !token) return;

    // Listen for new ride requests
    socket.on('new_ride_available', (data) => {
      // If we're already busy or offline, ignore
      if (activeRide || !driverPos) return;

      // Filter: only show if within 5km (fallback if not filtered by server)
      const dist = haversineDistance(
        driverPos[0], driverPos[1],
        data.pickup.lat, data.pickup.lng
      );
      
      if (dist <= 5000) {
        setIncomingRequest(data);
        setDistanceToUser(Math.round(dist));
        // Auto-clear after 15s if not accepted
        setTimeout(() => {
          setIncomingRequest(null);
        }, 15000);
      }
    });

    // Listen for ride status updates from server (via Redis/Mongo)
    // eslint-disable-next-line no-unused-vars
    socket.on(`ride_status_${user.id}`, (data) => {
       // Handle cross-service updates if needed
    });

    return () => {
      socket.off('new_ride_available');
    };
  }, [user, token, driverPos, activeRide]);

  return {
    incomingRequest,
    setIncomingRequest,
    activeRide,
    setActiveRide,
    distanceToUser,
    status,
    setStatus
  };
};
