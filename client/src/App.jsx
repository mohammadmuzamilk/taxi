import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import AuthFlow from './components/auth/AuthFlow';
import HomePage from './components/home/HomePage';

function App() {
  const [appState, setAppState] = useState('loading'); // loading, auth, dashboard
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAppState('dashboard');
    } else {
      // Simulate initial app loading
      const timer = setTimeout(() => {
        setAppState('auth');
      }, 4500); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAuthComplete = (data) => {
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    setAppState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAppState('auth');
  };

  if (appState === 'loading') {
    return <LoadingScreen />;
  }

  if (appState === 'auth') {
    return <AuthFlow onAuthComplete={handleAuthComplete} />;
  }

  return (
    <HomePage user={user} onLogout={handleLogout} />
  );
}

export default App;
