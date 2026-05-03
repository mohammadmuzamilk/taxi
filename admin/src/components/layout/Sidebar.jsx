import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Car size={20} />, label: 'Drivers', path: '/drivers' },
    { icon: <MapPin size={20} />, label: 'Rides', path: '/rides' },
    { icon: <Users size={20} />, label: 'Users', path: '/users' },
    { icon: <CreditCard size={20} />, label: 'Payments', path: '/payments' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen bg-black text-white flex flex-col fixed left-0 top-0 border-r border-yellow-400/20">
      <div className="p-6 border-b border-yellow-400/20">
        <h1 className="text-2xl font-bold text-yellow-400 italic">ChardhoGo Admin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                ? 'bg-yellow-400 text-black font-bold'
                : 'text-slate-400 hover:bg-yellow-400/10 hover:text-yellow-400'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-yellow-400/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full text-slate-400 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
