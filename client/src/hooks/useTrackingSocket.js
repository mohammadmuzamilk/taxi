import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { config } from '../config';

export const useTrackingSocket = (token, role, rideId = null) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(config.TRACKING_URL, {
      path: config.TRACKING_PATH,
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log(`[Tracking] Connected as ${role}`);
      
      if (role === 'client' && rideId) {
        socketRef.current.emit('join_ride_tracking', { rideId });
      }
    });

    socketRef.current.on('driver_location_update', (data) => {
      // data: { driverId, lat, lng }
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [token, role, rideId]);

  // For drivers to emit their location
  const emitLocation = (lat, lng, currentRideId = null) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update_location', { lat, lng, rideId: currentRideId });
    }
  };

  return { driverLocation, emitLocation };
};
