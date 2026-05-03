import React, { useState, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

// Utils & Sockets
import { socket } from './utils/socket';

// Hooks
import { useDriverAuth } from './hooks/useDriverAuth';
import { useDriverLocation } from './hooks/useDriverLocation';
import { useDriverSocket } from './hooks/useDriverSocket';
import { useDriverRide } from './hooks/useDriverRide';

// Components
import { LoginScreen } from './components/auth/LoginScreen';
import { IncomingRequestModal } from './components/ride/IncomingRequestModal';
import { OTPVerificationOverlay } from './components/ride/OTPVerificationOverlay';
import BottomNavigation from './components/BottomNavigation';
import { PWAInstallPrompt, OfflineStatus } from './components/pwa/PWAComponents';

// Pages (Lazy)
const Home = lazy(() => import('./pages/Home'));
const Trips = lazy(() => import('./pages/Trips'));
const Earnings = lazy(() => import('./pages/Earnings'));
const Account = lazy(() => import('./pages/Account'));

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(false);

  // 1. Authentication
  const auth = useDriverAuth();
  const { user, token, handleLogout } = auth;

  // 2. Location Tracking
  const { driverPos } = useDriverLocation(isOnline);

  // 3. Ride Lifecycle
  const ride = useDriverRide(token, user);
  const { activeRide, status, updateRideStatus, showOtpOverlay, setShowOtpOverlay, setTrackingLink } = ride;

  // 4. Real-time Events
  const socketData = useDriverSocket(user, token, driverPos);
  const { incomingRequest, setIncomingRequest, distanceToUser } = socketData;

  // ── Actions ────────────────────────────────────────────────────────────────
  
  const toggleOnline = () => {
    if (!user) return; // Safety check
    const next = !isOnline;
    setIsOnline(next);
    if (next) {
      socket.emit('driver_online', { userId: user.id, ...user });
    } else {
      // Disconnect/Reconnect to clear "online" status on server
      socket.disconnect();
      socket.connect(); 
    }
  };

  const handleAcceptRide = async () => {
    if (!incomingRequest) return;
    const success = await ride.acceptRide(incomingRequest, driverPos);
    if (success) {
      setIncomingRequest(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen w-full bg-black text-white font-sans selection:bg-yellow-500/30 overflow-hidden">
      
      {/* ── Auth Layer ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!token && (
          <LoginScreen {...auth} />
        )}
      </AnimatePresence>

      {/* ── Main App Content ─────────────────────────────────────────────── */}
      <div className="h-full flex flex-col">
        
        {/* Tab Content */}
        <div className="flex-1 relative overflow-hidden">
          <Suspense fallback={<div className="h-full flex items-center justify-center bg-zinc-950 text-yellow-500 font-black italic text-xl animate-pulse">LOADING...</div>}>
            {activeTab === 'home' && (
              <Home 
                isOnline={isOnline} 
                toggleOnline={toggleOnline} 
                user={user} 
                driverPos={driverPos} 
                activeRide={activeRide}
                status={status}
                updateRideStatus={updateRideStatus}
                setShowOtpOverlay={setShowOtpOverlay}
              />
            )}

            {activeTab === 'trips' && <Trips user={user} />}
            {activeTab === 'earnings' && <Earnings user={user} />}
            {activeTab === 'account' && <Account user={user} onLogout={handleLogout} />}
          </Suspense>

          {/* OTP Verification Overlay */}
          {showOtpOverlay && activeRide && (
            <OTPVerificationOverlay 
              rideId={activeRide.rideId || activeRide.id} 
              token={token}
              onVerified={(link) => {
                setTrackingLink(link);
                setShowOtpOverlay(false);
                updateRideStatus('ongoing');
              }}
              onCancel={() => setShowOtpOverlay(false)}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        {token && <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>

      {/* ── Incoming Ride Request Modal ──────────────────────────────────── */}
      <IncomingRequestModal 
        request={incomingRequest}
        distance={distanceToUser}
        onAccept={handleAcceptRide}
        onDecline={() => setIncomingRequest(null)}
      />

      <OfflineStatus />
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
