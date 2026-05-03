import React, { useState, useEffect, lazy, Suspense } from 'react';
import LoadingScreen from './components/LoadingScreen';
import { PWAInstallPrompt, OfflineStatus } from './components/pwa/PWAComponents';

import { config } from './config';

const AuthFlow = lazy(() => import('./components/auth/AuthFlow'));
const HomePage = lazy(() => import('./components/home/HomePage'));

function App() {
  const [appState, setAppState] = useState('loading'); // loading, auth, dashboard
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const verifySession = async () => {
      const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Build headers — always try cookie first, but also send token from
        // localStorage as Bearer fallback (needed when Vite proxy is not running
        // or the session cookie gets blocked cross-origin)
        const storedToken = localStorage.getItem('userToken');
        const headers = {};
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const responsePromise = fetch(`${config.AUTH_SERVICE}/me`, {
          credentials: 'include',
          headers
        });
        
        const [response] = await Promise.all([responsePromise, minDelay]);

        if (!isMounted) return;

        // Token expired or invalid — clear localStorage and show login
        if (response.status === 401) {
          localStorage.removeItem('userToken');
          setAppState('auth');
          return;
        }

        const data = await response.json();
        
        if (isMounted) {
          if (data.success) {
            setUser(data.data);
            if (data.data.isOnboarded) {
              setAppState('dashboard');
            } else {
              setAppState('auth');
            }
          } else {
            setAppState('auth');
          }
        }
      // eslint-disable-next-line no-unused-vars
      } catch (_ERR) {
        if (isMounted) {
          setAppState('auth');
        }
      }
    };
    
    verifySession();
    
    return () => { isMounted = false; };
  }, []);


  const handleAuthComplete = (data) => {
    setUser(data);
    setAppState('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${config.AUTH_SERVICE}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('userToken');
    setUser(null);
    setAppState('auth');
  };

  const handleRoleSwitch = (newUser) => {
    setUser(newUser);
    setAppState('auth'); // This will trigger AuthFlow which detects role change and shows onboarding
  };

  if (appState === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <OfflineStatus />
      <PWAInstallPrompt />
      {appState === 'auth' ? (
        <AuthFlow onAuthComplete={handleAuthComplete} initialUser={user} />
      ) : (
        <HomePage user={user} onUpdateUser={setUser} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />
      )}
    </Suspense>
  );
}

export default App;
