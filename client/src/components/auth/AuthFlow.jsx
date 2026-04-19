import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './LoginScreen';
import UserSetup from './UserSetup';
import DriverOnboarding from './DriverOnboarding';

const AuthFlow = ({ onAuthComplete }) => {
  const [authState, setAuthState] = useState('login'); // login -> role-selection -> user-setup / driver-onboarding
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = (data) => {
    // In a real app, check if user is returning or new
    // For this demo, we assume new user to show the full flow
    setUserData(data);
    if (data.role === 'user') {
      setAuthState('user-setup');
    } else {
      setAuthState('driver-onboarding');
    }
  };

  const handleSetupComplete = async (data) => {
    const finalData = { ...userData, ...data };
    console.log('Final Data to Save:', finalData);
    
    try {
      // Store user details in MongoDB
      const response = await fetch(`http://${window.location.hostname}:5001/api/auth/update-me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      
      const result = await response.json();
      if (result.success) {
        onAuthComplete(result.data);
      } else {
        console.error('Failed to save profile:', result.error);
        onAuthComplete(finalData); // Fallback
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
            <UserSetup onComplete={handleSetupComplete} />
          </motion.div>
        )}
        {authState === 'driver-onboarding' && (
          <motion.div key="driver-setup" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <DriverOnboarding onComplete={handleSetupComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthFlow;
