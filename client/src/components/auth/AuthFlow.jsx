import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './LoginScreen';
import UserSetup from './UserSetup';
import DriverOnboarding from './DriverOnboarding';
import { config } from '../../config';

const AuthFlow = ({ onAuthComplete, initialUser }) => {
  const [authState, setAuthState] = useState(() => {
    if (!initialUser) return 'login';
    return initialUser.role === 'driver' ? 'driver-onboarding' : 'user-setup';
  });
  const [userData, setUserData] = useState(initialUser);

  const handleLoginSuccess = (data) => {
    setUserData(data);
    
    // If already onboarded, complete immediately
    if (data.isOnboarded) {
      onAuthComplete(data);
      return;
    }

    // Otherwise, route to appropriate setup
    if (data.role === 'driver') {
      setAuthState('driver-onboarding');
    } else {
      setAuthState('user-setup');
    }
  };

  const handleSetupComplete = async (data) => {
    const finalData = { ...userData, ...data };

    try {
      // Update user profile — PUT /api/auth/me
      const response = await fetch(`${config.AUTH_SERVICE}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: finalData.name })
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (result.success) {
        onAuthComplete({ ...finalData, ...result.data });
      } else {
        // Fallback: proceed with local data even if server update fails
        onAuthComplete(finalData);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      onAuthComplete(finalData); // Fallback
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-screen bg-white">
      <AnimatePresence mode="wait">
        {authState === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        )}

        {authState === 'user-setup' && (
          <motion.div key="user-setup" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <UserSetup onComplete={handleSetupComplete} user={userData} onBack={() => setAuthState('login')} />
          </motion.div>
        )}
        {authState === 'driver-onboarding' && (
          <motion.div key="driver-setup" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <DriverOnboarding onComplete={handleSetupComplete} user={userData} onBack={() => setAuthState('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthFlow;

