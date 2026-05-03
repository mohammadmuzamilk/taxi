import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

// eslint-disable-next-line no-unused-vars
export const useTrackingSocket = (token, role = 'driver') => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(API_URL, {
      path: '/api/tracking',
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log(`[Tracking] Driver connected to live location server`);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [token]);

  // Hook into the main geolocation watch position in App.jsx to call this
  const emitLocation = (lat, lng, currentRideId = null) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update_location', { lat, lng, rideId: currentRideId });
    }
  };

  return { emitLocation };
};
