import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import AuthFlow from './components/auth/AuthFlow';

function App() {
  const [appState, setAppState] = useState('loading'); // loading, auth, dashboard
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setAppState('auth');
    }, 4500); // 4.5 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  const handleAuthComplete = (data) => {
    setUser(data);
    setAppState('dashboard');
  };

  if (appState === 'loading') {
    return <LoadingScreen />;
  }

  if (appState === 'auth') {
    return <AuthFlow onAuthComplete={handleAuthComplete} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-slate-800 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
        <h1 className="text-4xl font-black mb-4 text-zinc-900 tracking-tight">
            Chardho <span className="text-yellow-500">Go</span>
        </h1>
        <p className="text-lg mb-8 text-zinc-500 font-medium">
            Welcome, <span className="text-zinc-900 font-bold">{user?.name || 'User'}</span>! 
            You are logged in as a <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg text-sm">{user?.role}</span>
        </p>
        <button 
           onClick={() => setAppState('auth')}
           className="w-full px-6 py-4 bg-zinc-900 text-white rounded-2xl hover:bg-black transition duration-300 shadow-md font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
