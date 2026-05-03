import { useState, useEffect, useCallback, useRef } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: 'Fetching address...',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionState, setPermissionState] = useState('prompt'); // granted, denied, prompt
  const watchIdRef = useRef(null);

  const fetchAddress = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim for free reverse geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'ChardhoGoApp/1.0'
        }
      });
      const data = await response.json();
      return data.display_name || 'Address not found';
    } catch (err) {
      console.warn("Reverse geocoding failed", err);
      return "Address unavailable";
    }
  };

  const handleSuccess = useCallback(async (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    
    // Initial update without address to feel fast
    setLocation(prev => ({
      ...prev,
      latitude,
      longitude,
      accuracy: Math.round(accuracy)
    }));
    setError(null);
    setIsLoading(false);

    // Fetch human-readable address asynchronously
    const address = await fetchAddress(latitude, longitude);
    setLocation(prev => ({
      ...prev,
      address
    }));
  }, []);

  const handleError = useCallback((err) => {
    let errorMessage = "Unknown location error";
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable it in your browser settings.";
        setPermissionState('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = "Location information is currently unavailable. Ensure GPS is turned on.";
        break;
      case err.TIMEOUT:
        errorMessage = "The request to get user location timed out. Trying again...";
        break;
      default:
        errorMessage = `An unknown error occurred: ${err.message}`;
    }
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    if (!window.isSecureContext) {
      setError("Geolocation requires a secure context (HTTPS or localhost).");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    // 1. Get initial position quickly
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // 2. Clear any existing watcher
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // 3. Set up continuous watching
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
  }, [handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Check permission state natively if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => {
          setPermissionState(result.state);
          if (result.state === 'granted') {
             startTracking();
          } else if (result.state === 'denied') {
             stopTracking();
             setError("Location permission denied.");
          }
        };
      }).catch(err => console.warn("Permissions API not fully supported:", err));
    }
    
    // Auto-start tracking on mount
    // eslint-disable-next-line
    startTracking();

    return () => stopTracking();
  }, [startTracking, stopTracking]);

  return { location, error, isLoading, permissionState, startTracking, stopTracking };
};

export default useGeolocation;
