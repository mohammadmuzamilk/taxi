import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Car, Zap } from 'lucide-react';

import MapBackground from './components/MapBackground';
import TopHeader from './components/TopHeader';
import BottomNavigation from './components/BottomNavigation';
import SchedulingOverlay from '../booking/SchedulingOverlay';
import SearchingOverlay from '../booking/SearchingOverlay';
import DriverStatusCard from './components/DriverStatusCard';
import RideSelectionPanel from '../booking/RideSelectionPanel';
import HeroSection from './components/HeroSection';
import MapSelectionOverlay from '../booking/MapSelectionOverlay';
import HistoryView from '../account/HistoryView';
import FavoritesView from '../account/FavoritesView';
import SettingsView from '../account/SettingsView';
import { SOSButton } from '../pwa/SOSButton';
import { ActiveRideCard } from '../ride/ActiveRideCard';
import BecomeDriverCTA from '../account/BecomeDriverCTA';
import { useHomePage } from './hooks/useHomePage';

const rideTypes = [
  { id: 'car', name: 'Premium Car', price: '₹450', eta: '3 min', icon: <Car size={24} />, color: 'bg-yellow-500' },
  { id: 'auto', name: 'Auto Rickshaw', price: '₹250', eta: '5 min', icon: <Car size={24} />, color: 'bg-emerald-500' },
  { id: 'bike', name: 'Fast Bike', price: '₹150', eta: '2 min', icon: <Zap size={24} />, color: 'bg-zinc-900' },
];

const HomePage = ({ user, onUpdateUser, onLogout, onRoleSwitch }) => {
  const { state, handlers } = useHomePage(user, onRoleSwitch);

  const {
    activeView, setActiveView,
    isSearching, setIsSearching,
    selectedRide, setSelectedRide,
    activeTab, setActiveTab,
    searchValue, setSearchValue,
    isScheduling, setIsScheduling,
    rideStatus, setRideStatus,
    currentRide,
    showMapOverlay, setShowMapOverlay,
    mapOverlayMode, setMapOverlayMode,
    pickupLocation, setPickupLocation,
    userCoords, setUserCoords,
    nearbyDrivers,
  } = state;

  const { handleJoinAsDriver, handleConfirmRide } = handlers;

  return (
    <div className="relative h-screen w-full bg-zinc-950 overflow-hidden text-white font-inter">
      <MapBackground />
      <TopHeader user={user} onLogout={onLogout} />

      <AnimatePresence mode="wait">
        {activeView === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <HeroSection
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              setSelectedRide={setSelectedRide}
              setShowMapOverlay={setShowMapOverlay}
              setMapOverlayMode={setMapOverlayMode}
              pickupLocation={pickupLocation}
              setPickupLocation={setPickupLocation}
              setUserCoords={setUserCoords}
            />

            {/* --- Become a Driver CTA --- */}
            {!isSearching && !currentRide && user?.role === 'client' && (
              <BecomeDriverCTA onJoin={handleJoinAsDriver} />
            )}

            <RideSelectionPanel
              selectedRide={selectedRide}
              setSelectedRide={setSelectedRide}
              handleConfirmRide={(driverId) => handleConfirmRide(driverId, rideTypes)}
              rideTypes={rideTypes}
              nearbyDrivers={nearbyDrivers}
            />

            {(rideStatus === 'accepted' || rideStatus === 'ongoing') && currentRide ? (
              <ActiveRideCard ride={currentRide} token={localStorage.getItem('userToken')} />
            ) : (
              <SearchingOverlay
                rideStatus={rideStatus}
                onCancel={handlers.handleCancelRide}
                token={localStorage.getItem('userToken')} 
              />
            )}
            
            {rideStatus !== 'accepted' && rideStatus !== 'ongoing' && (
              <DriverStatusCard
                rideStatus={rideStatus}
                currentRide={currentRide}
              />
            )}

            {/* New Active Ride Card with Live Tracking */}
            {(rideStatus === 'accepted' || rideStatus === 'ongoing') && currentRide && (
              <ActiveRideCard ride={currentRide} token={localStorage.getItem('clientToken')} />
            )}

            {/* SOS Button for safety during rides */}
            {(rideStatus === 'accepted' || rideStatus === 'ongoing') && currentRide && (
              <SOSButton 
                lat={userCoords?.lat || 0} 
                lng={userCoords?.lng || 0} 
                rideId={currentRide.id || currentRide._id} 
                token={localStorage.getItem('clientToken')} 
              />
            )}

            <SchedulingOverlay
              isScheduling={isScheduling}
              setIsScheduling={setIsScheduling}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        )}
        
        {activeView === 'history' && <HistoryView key="history" />}
        {activeView === 'favorites' && (
          <FavoritesView 
            key="favorites" 
            user={user}
            onUpdateUser={onUpdateUser}
            setSearchValue={setSearchValue} 
            setActiveView={setActiveView} 
            setShowMapOverlay={setShowMapOverlay}
            setIsSearching={setIsSearching}
            setMapOverlayMode={setMapOverlayMode}
          />
        )}
        {activeView === 'settings' && <SettingsView key="settings" user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />}
      </AnimatePresence>

      <MapSelectionOverlay
        showMapOverlay={showMapOverlay}
        setShowMapOverlay={setShowMapOverlay}
        mapOverlayMode={mapOverlayMode}
        setSearchValue={setSearchValue}
        setIsSearching={setIsSearching}
        setSelectedRide={setSelectedRide}
        userCoords={userCoords}
        setUserCoords={setUserCoords}
        onUpdateUser={onUpdateUser}
      />

      <BottomNavigation
        selectedRide={selectedRide}
        isSearching={isSearching}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {activeTab === 'schedule' && !isSearching && !selectedRide && activeView === 'home' && (
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
