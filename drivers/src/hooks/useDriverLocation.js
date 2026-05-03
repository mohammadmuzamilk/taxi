import { useState, useEffect } from 'react';
import { socket } from '../utils/socket';

export const useDriverLocation = (isOnline, activeRide) => {
  const [driverPos, setDriverPos] = useState(null);

  useEffect(() => {
    if (!isOnline) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setDriverPos(newPos);
        
        // Emit to server for matching and tracking
        socket.emit('driver_location_update', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          rideId: activeRide?.rideId || activeRide?.id
        });
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, activeRide]);

  return { driverPos, setDriverPos };
};
