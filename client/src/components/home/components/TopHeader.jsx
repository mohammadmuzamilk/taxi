import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Car, Star } from 'lucide-react';

const TopHeader = ({ user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const dummyNotifications = [
    { id: 1, type: 'ride', title: 'Ride Completed', desc: 'Your ride to Tech Hub was completed.', time: '2m ago', icon: <CheckCircle2 size={16} className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
    { id: 2, type: 'promo', title: '50% Off Your Next Ride!', desc: 'Use code CHARDHO50. Valid until tomorrow.', time: '1h ago', icon: <Star size={16} className="text-yellow-500" />, bg: 'bg-yellow-500/10' },
    { id: 3, type: 'alerts', title: 'Driver Assigned', desc: 'Rahul is arriving in a Premium Car (DL-1C-AA-1111).', time: '2h ago', icon: <Car size={16} className="text-blue-500" />, bg: 'bg-blue-500/10' },
  ];

  const [filteredNotifs, setFilteredNotifs] = useState(dummyNotifications);

  const updateNotifs = () => {
    const saved = localStorage.getItem('pushNotifs');
    const prefs = saved ? JSON.parse(saved) : { ride: true, promo: false, alerts: true };
    setFilteredNotifs(dummyNotifications.filter(n => prefs[n.type]));
  };

  useEffect(() => {
    updateNotifs();
    window.addEventListener('pushNotifsChanged', updateNotifs);
    return () => window.removeEventListener('pushNotifsChanged', updateNotifs);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-xl mx-auto backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-2 flex items-center justify-between shadow-2xl pointer-events-auto"
      >
        {/* Left: Branding */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-linear-to-br from-yellow-400 to-orange-600 flex items-center justify-center shrink-0">
            {!imgError ? (
              <img 
                src="/pwa-192x192.png" 
                alt="Logo" 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-white font-black text-xl pointer-events-none">C</span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase italic leading-none text-white">
              CHARDHO <span className="text-yellow-500">GO</span>
            </h2>
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Premium Taxi</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${showNotifications ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-yellow-500 rounded-full ring-2 ring-zinc-900 shadow-sm"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-80 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-60"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Activity</h3>
                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded-full border border-yellow-500/20">
                      {filteredNotifs.length} New
                    </span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {filteredNotifs.length > 0 ? (
                      filteredNotifs.map((notif) => (
                        <div key={notif.id} className="p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors cursor-pointer group">
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.bg} group-hover:scale-110 transition-transform`}>
                              {notif.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                                <span className="text-[10px] text-zinc-500 font-medium">{notif.time}</span>
                              </div>
                              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{notif.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-zinc-600" />
                        </div>
                        <p className="text-xs text-zinc-500 font-medium tracking-tight">No notifications yet.</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white/5 border-t border-white/5">
                    <button className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                      View All Inbox
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Button */}
          <button 
            onClick={onLogout} 
            className="w-10 h-10 bg-white text-zinc-950 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg shadow-white/5 overflow-hidden active:scale-95 transition-all"
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0) || 'U'}</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TopHeader;
