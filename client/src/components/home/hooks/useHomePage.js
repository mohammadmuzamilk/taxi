import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { config } from '../../../config';

// ─── Socket singleton (module-level) — created once, connected on demand ─────
let socketInstance = null;
export const getSocket = (token) => {
  if (!socketInstance) {
    socketInstance = io(config.SOCKET_URL, {
      path:        config.SOCKET_PATH,
      autoConnect: false,
      reconnection:        true,
      reconnectionDelay:   2000,
      reconnectionAttempts: 5,
      auth: token ? { token } : {},
      withCredentials: true,
    });
  }
  return socketInstance;
};

export const useHomePage = (user, onRoleSwitch) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeView, setActiveView]         = useState(localStorage.getItem('activeView') || 'home'); // 'home' | 'history' | 'favorites' | 'settings'
  const [isSearching, setIsSearching]       = useState(false);

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);
  const [selectedRide, setSelectedRide]     = useState(null);
  const [activeTab, setActiveTab]           = useState('now');
  const [searchValue, setSearchValue]       = useState('');
  const [isScheduling, setIsScheduling]     = useState(false);
  const [rideStatus, setRideStatus]         = useState('idle');
  const [currentRide, setCurrentRide]       = useState(null);
  const [_driverLocation, setDriverLocation] = useState(null);
  const [showMapOverlay, setShowMapOverlay] = useState(false);
  const [mapOverlayMode, setMapOverlayMode] = useState('booking'); // 'booking' | 'favorite'
  const [pickupLocation, setPickupLocation] = useState('');
  const [userCoords, setUserCoords]         = useState(null);
  const [nearbyDrivers, setNearbyDrivers]   = useState([]);

  const socketRef = useRef(null);
  const hasAttemptedConnect = useRef(false);

  // ── Connect socket only once when user is authenticated ─────────────────────
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('userToken');
    const socket = getSocket(token);
    socketRef.current = socket;

    if (!socket.connected && !hasAttemptedConnect.current) {
      hasAttemptedConnect.current = true;
      console.log('🔌 Connecting socket (user authenticated)...');
      socket.connect();
    }

    const onConnect      = () => console.log('✅ Socket connected:', socket.id);
    const onConnectError = (err) => console.warn('⚠️ Socket error:', err.message);

    socket.on('connect',       onConnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect',       onConnect);
      socket.off('connect_error', onConnectError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← empty array: run once on mount

  // ── Capture user GPS coords once on mount ───────────────────────────────────
  useEffect(() => {
    if (!window.isSecureContext) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}, // silently fail
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Fetch active ride on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchActiveRide = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${config.RIDE_V2}/active`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentRide(data.data);
          setRideStatus(data.data.status);
        }
      } catch (err) {
        console.error('Failed to fetch active ride:', err);
      }
    };
    fetchActiveRide();
  }, [user]);

  // Fetch nearby drivers when selectedRide changes
  useEffect(() => {
    if (selectedRide && userCoords) {
      const fetchNearbyDrivers = async () => {
        try {
          const token = localStorage.getItem('userToken');
          const response = await fetch(`${config.RIDE_V2}/nearby-drivers?lat=${userCoords.lat}&lng=${userCoords.lng}&vehicleType=${selectedRide}`, {
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          });
          const data = await response.json();
          if (data.success) {
            setNearbyDrivers(data.data);
          }
        } catch (err) {
          console.error('Failed to fetch nearby drivers:', err);
        }
      };
      fetchNearbyDrivers();
    } else {
      setNearbyDrivers([]);
    }
  }, [selectedRide, userCoords]);

  // ── Listen for ride updates via socket ──────────────────────────────────────
  useEffect(() => {
    if (!currentRide) return;
    const socket = socketRef.current;
    if (!socket) return;

    const rideId = currentRide.id || currentRide._id;

    const handleAccepted = (data) => {
      setRideStatus('accepted');
      setCurrentRide(prev => ({ ...prev, driver: data.driverData || data.driver }));
    };
    const handleStatus = (data) => {
      setRideStatus(data.status);
      if (data.driver) setCurrentRide(prev => ({ ...prev, driver: data.driver }));
      if (data.status === 'completed') {
        alert('Ride Completed! Hope you had a great trip.');
        setRideStatus('idle');
        setCurrentRide(null);
      }
    };
    const handleDriverMoved  = (location) => setDriverLocation(location);
    const handleStatusChange = (status) => {
      setRideStatus(status);
      if (status === 'completed') {
        alert('Ride Completed! Hope you had a great trip.');
        setRideStatus('idle');
        setCurrentRide(null);
      }
    };

    socket.on(`ride_accepted_${rideId}`,   handleAccepted);
    socket.on(`ride_status_${rideId}`,     handleStatus);
    socket.on(`driver_moved_${rideId}`,    handleDriverMoved);
    socket.on(`status_changed_${rideId}`,  handleStatusChange);

    return () => {
      socket.off(`ride_accepted_${rideId}`,  handleAccepted);
      socket.off(`ride_status_${rideId}`,    handleStatus);
      socket.off(`driver_moved_${rideId}`,   handleDriverMoved);
      socket.off(`status_changed_${rideId}`, handleStatusChange);
    };
  }, [currentRide]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleJoinAsDriver = async () => {
    try {
      const response = await fetch(`${config.AUTH_SERVICE}/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: 'driver' })
      });
      const data = await response.json();
      if (data.success) {
        onRoleSwitch(data.data);
      }
    } catch (err) {
      console.error('Failed to join as driver:', err);
    }
  };

  const handleConfirmRide = async (driverId, rideTypes) => {
    if (user?.role !== 'user' && user?.role !== 'driver') {
      alert('Only users can book rides. Please login with a user account.');
      return;
    }
    const token = localStorage.getItem('userToken');
    const selectedRideType = rideTypes.find(r => r.id === selectedRide);

    const flattenedRideData = {
      pickupLat:     userCoords?.lat || 0,
      pickupLng:     userCoords?.lng || 0,
      pickupAddress: pickupLocation || 'Current Location',
      dropLat:       0,
      dropLng:       0,
      dropAddress:   searchValue,
      vehicleType:   selectedRide,
      driverId:      driverId,
      fare:          parseInt(selectedRideType?.price?.replace(/[₹,]/g, '') || '0')
    };

    try {
      const response = await fetch(`${config.RIDE_V2}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(flattenedRideData)
      });
      const data = await response.json();

      if (data.success) {
        setRideStatus('searching');
        setCurrentRide(data.data);
        setSelectedRide(null);
      } else {
        console.error('Ride request failed:', data.error || data.message || 'Unknown server error');
        alert(`Booking failed: ${data.error || data.message || 'Please try again'}`);
      }
    } catch (err) {
      console.error('Ride Request Error:', err.message);
      alert('Network error. Is the backend running?');
    }
  };

  const handleCancelRide = async () => {
    if (!currentRide) {
      setRideStatus('idle');
      return;
    }
    const rideId = currentRide.id || currentRide._id;
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.RIDE_V2}/${rideId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await response.json();
      if (data.success) {
        setRideStatus('idle');
        setCurrentRide(null);
      }
    } catch (err) {
      console.error('Failed to cancel ride:', err);
      // Fallback
      setRideStatus('idle');
      setCurrentRide(null);
    }
  };

  return {
    state: {
      activeView, setActiveView,
      isSearching, setIsSearching,
      selectedRide, setSelectedRide,
      activeTab, setActiveTab,
      searchValue, setSearchValue,
      isScheduling, setIsScheduling,
      rideStatus, setRideStatus,
      currentRide, setCurrentRide,
      _driverLocation,
      showMapOverlay, setShowMapOverlay,
      mapOverlayMode, setMapOverlayMode,
      pickupLocation, setPickupLocation,
      userCoords, setUserCoords,
      nearbyDrivers,
    },
    handlers: {
      handleJoinAsDriver,
      handleConfirmRide,
      handleCancelRide,
    }
  };
};
