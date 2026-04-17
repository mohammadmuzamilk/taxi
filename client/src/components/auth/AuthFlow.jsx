import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './LoginScreen';
import RoleSelection from './RoleSelection';
import UserSetup from './UserSetup';
import DriverOnboarding from './DriverOnboarding';

const AuthFlow = ({ onAuthComplete }) => {
  const [authState, setAuthState] = useState('login'); // login -> role-selection -> user-setup / driver-onboarding
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = () => {
    // In a real app, check if user is returning or new
    // For this demo, we assume new user to show the full flow
    setAuthState('role-selection');
  };

  const handleRoleSelection = (role) => {
    setUserData({ ...userData, role });
    if (role === 'user') setAuthState('user-setup');
    else setAuthState('driver-onboarding');
  };

  const handleSetupComplete = (data) => {
    const finalData = { ...userData, ...data };
    console.log('Auth Complete:', finalData);
    onAuthComplete(finalData);
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-screen bg-white">
      <AnimatePresence mode="wait">
        {authState === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        )}
        {authState === 'role-selection' && (
          <motion.div key="role" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <RoleSelection onSelect={handleRoleSelection} />
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
