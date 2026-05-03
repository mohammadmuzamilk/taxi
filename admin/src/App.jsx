import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './modules/dashboard/Dashboard';
import Drivers from './modules/drivers/Drivers';
import Rides from './modules/rides/Rides';
import Users from './modules/users/Users';
import Payments from './modules/payments/Payments';
import Login from './modules/auth/Login';
import Settings from './modules/settings/Settings';
import { PWAInstallPrompt, OfflineStatus } from './components/pwa/PWAComponents';

const App = () => {
  return (
    <Router>
      <div className="admin-app">
        <PWAInstallPrompt />
        <OfflineStatus />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="rides" element={<Rides />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
