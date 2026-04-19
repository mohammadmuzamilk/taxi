import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Car, ShieldCheck, Zap } from 'lucide-react';
import { io } from 'socket.io-client';

import MapBackground from './components/MapBackground';
import TopHeader from './components/TopHeader';
import BottomNavigation from './components/BottomNavigation';
import SchedulingOverlay from './components/SchedulingOverlay';
import SearchingOverlay from './components/SearchingOverlay';
import DriverStatusCard from './components/DriverStatusCard';
import RideSelectionPanel from './components/RideSelectionPanel';
import HeroSection from './components/HeroSection';
import MapSelectionOverlay from './components/MapSelectionOverlay';
import { config } from '../../config';

const socket = io(config.SOCKET_URL, {
  path: config.SOCKET_PATH
});

const HomePage = ({ user, onLogout }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [activeTab, setActiveTab] = useState('now');
  const [searchValue, setSearchValue] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [rideStatus, setRideStatus] = useState('idle');
  const [currentRide, setCurrentRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [showMapOverlay, setShowMapOverlay] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [userCoords, setUserCoords] = useState(null);

  // Capture user GPS coords once on mount for the map overlay
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => { } // silently fail
      );
    }
  }, []);

  useEffect(() => {
    if (!currentRide) return;

    const rideId = currentRide._id;

    socket.on(`ride_accepted_${rideId}`, (data) => {
      setRideStatus('accepted');
      setCurrentRide(prev => ({ ...prev, driver: data.driverData }));
    });

    socket.on(`driver_moved_${rideId}`, (location) => {
      setDriverLocation(location);
    });

    socket.on(`status_changed_${rideId}`, (status) => {
      setRideStatus(status);
      if (status === 'completed') {
        alert('Ride Completed! Hope you had a great trip.');
        setRideStatus('idle');
        setCurrentRide(null);
      }
    });

    return () => {
      socket.off(`ride_accepted_${rideId}`);
      socket.off(`driver_moved_${rideId}`);
      socket.off(`status_changed_${rideId}`);
    };
  }, [currentRide]);

  const handleConfirmRide = async () => {
    const rideData = {
      user: { id: user?.id || 'usr_123', name: user?.name, phone: user?.phone },
      pickup: { address: 'My Location', lat: 28.6139, lng: 77.2090 },
      drop: { address: searchValue, lat: 28.5355, lng: 77.3910 },
      fare: 450,
      distance: '12 km',
      duration: '25 min'
    };

    try {
      const response = await fetch(`${config.RIDE_SERVICE}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rideData)
      });
      const data = await response.json();

      if (data.success) {
        setRideStatus('searching');
        setCurrentRide(data.data);
        socket.emit('ride_request', { rideId: data.data._id, ...rideData });
        setSelectedRide(null);
      }
    } catch (err) {
      console.error('Ride Request Error:', err);
    }
  };

  const rideTypes = [
    { id: 'prime', name: 'Prime Sedan', price: '₹450', eta: '3 min', icon: <Car size={24} />, color: 'bg-yellow-500' },
    { id: 'black', name: 'Premium Black', price: '₹850', eta: '5 min', icon: <ShieldCheck size={24} />, color: 'bg-zinc-900' },
    { id: 'electric', name: 'Eco Electric', price: '₹420', eta: '7 min', icon: <Zap size={24} />, color: 'bg-emerald-500' },
  ];

  return (
    <div className="relative h-screen w-full bg-zinc-950 overflow-hidden text-white font-inter">
      <MapBackground />
      <TopHeader user={user} onLogout={onLogout} />

      <HeroSection
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        setSelectedRide={setSelectedRide}
        setShowMapOverlay={setShowMapOverlay}
        pickupLocation={pickupLocation}
        setPickupLocation={setPickupLocation}
        setUserCoords={setUserCoords}
      />

      <RideSelectionPanel
        selectedRide={selectedRide}
        setSelectedRide={setSelectedRide}
        handleConfirmRide={handleConfirmRide}
        rideTypes={rideTypes}
      />

      <MapSelectionOverlay
        showMapOverlay={showMapOverlay}
        setShowMapOverlay={setShowMapOverlay}
        setSearchValue={setSearchValue}
        setIsSearching={setIsSearching}
        setSelectedRide={setSelectedRide}
        userCoords={userCoords}
        setUserCoords={setUserCoords}
      />

      <SearchingOverlay
        rideStatus={rideStatus}
        setRideStatus={setRideStatus}
      />

      <DriverStatusCard
        rideStatus={rideStatus}
        currentRide={currentRide}
      />

      <SchedulingOverlay
        isScheduling={isScheduling}
        setIsScheduling={setIsScheduling}
        setActiveTab={setActiveTab}
      />

      <BottomNavigation
        selectedRide={selectedRide}
        isSearching={isSearching}
      />

      {activeTab === 'schedule' && !isSearching && !selectedRide && (
        <motion.button
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsScheduling(true)}
          className="absolute bottom-28 right-8 z-50 w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center shadow-2xl shadow-white/10 border border-white/20"
        >
          <Calendar size={28} />
        </motion.button>
      )}
    </div>
  );
};

export default HomePage;
