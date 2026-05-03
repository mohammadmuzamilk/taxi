import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, HelpCircle, LogOut, ChevronRight, ChevronLeft, Edit2, Lock, Smartphone, Check, Camera } from 'lucide-react';
import { config } from '../../../config';

const SubViewHeader = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-8">
    <button onClick={onBack} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
      <ChevronLeft size={20} />
    </button>
    <h2 className="text-2xl font-black tracking-tight">{title}</h2>
  </div>
);

const PersonalInfoView = ({ user, onUpdateUser, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePhoto: user?.profilePhoto || null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Real-time validation
    const newErrors = {};
    if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less.';
    }
    if (formData.email && !formData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = 'Email must be a @gmail.com address.';
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    }
    setErrors(newErrors);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize to max 400px while maintaining aspect ratio
          const MAX_SIZE = 400;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to 70% JPEG quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, profilePhoto: compressedDataUrl });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (Object.keys(errors).length === 0) {
      try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${config.AUTH_SERVICE}/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          if (onUpdateUser) {
            onUpdateUser({ ...user, ...formData });
          }
          setIsEditing(false);
        } else {
          alert('Failed to save profile: ' + data.error);
        }
      } catch (err) {
        console.error('Save error:', err);
        alert('Network error while saving profile.');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 z-50 bg-zinc-950 pt-32 px-6 overflow-y-auto pb-40">
      <SubViewHeader title="Personal Info" onBack={onBack} />
      <div className="space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center font-black text-4xl border-2 border-blue-500/50 overflow-hidden">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.name.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center text-white border-2 border-zinc-950 transition-colors"
              >
                <Edit2 size={14} />
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white border-2 border-zinc-950 transition-colors"
              >
                <Camera size={14} />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block pl-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 pl-2">{errors.name}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block pl-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-2">{errors.email}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block pl-2">Phone Number</label>
              <div className={`flex items-center bg-white/5 border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-2xl overflow-hidden focus-within:border-blue-500`}>
                <div className="pl-4 pr-3 py-4 text-zinc-400 font-bold border-r border-white/10 bg-black/20">
                  +91
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="10 digit number"
                  maxLength="10"
                  className="w-full bg-transparent p-4 text-white focus:outline-none"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 pl-2">{errors.phone}</p>}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => {
                  setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
                  setIsEditing(false);
                }}
                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={Object.keys(errors).length > 0}
                className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'Full Name', value: formData.name || 'Not set' },
              { label: 'Email Address', value: formData.email || 'Not set' },
              { label: 'Phone Number', value: formData.phone ? `+91 ${formData.phone}` : 'Not set' }
            ].map((field, i) => (
              <div key={i} className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{field.label}</p>
                <p className="font-bold">{field.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SecurityView = ({ user, onBack, syncSettings }) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(
    user?.clientProfile?.biometricEnabled ?? (localStorage.getItem('biometricEnabled') === 'true')
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [dataSharing, setDataSharing] = useState(() => {
    if (user?.clientProfile?.dataSharing) return user.clientProfile.dataSharing;
    const saved = localStorage.getItem('dataSharing');
    return saved ? JSON.parse(saved) : { location: true, analytics: false };
  });

  useEffect(() => {
    localStorage.setItem('dataSharing', JSON.stringify(dataSharing));
    if (syncSettings) syncSettings({ dataSharing });
  }, [dataSharing]);

  const handleEnableBiometrics = async () => {
    // ... logic remains
    if (!window.PublicKeyCredential) {
      alert('Biometric authentication is not supported on this device/browser.');
      return;
    }

    setIsAuthenticating(true);
    try {
      // Mocking WebAuthn challenge for fingerprint registration
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: { name: "Chardho Go", id: window.location.hostname },
        user: {
          id: new Uint8Array(16),
          name: "user@example.com",
          displayName: "User"
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" }  // RS256
        ],
        authenticatorSelection: { authenticatorAttachment: "platform" }, // Requires Fingerprint/FaceID
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (credential) {
        setIsBiometricEnabled(true);
        localStorage.setItem('biometricEnabled', 'true');
        if (syncSettings) syncSettings({ biometricEnabled: true });
        // In a real app, send `credential` to the backend to register the device.
      }
    } catch (err) {
      console.error('Biometric enrollment failed', err);
      // Fallback for user cancelling or failing
    } finally {
      setIsAuthenticating(false);
    }
  };

  const sharingOptions = [
    { id: 'location', title: 'Share Live Location', desc: 'Allow drivers to see your exact location' },
    { id: 'analytics', title: 'Analytics', desc: 'Help us improve by sharing usage data' }
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 z-50 bg-zinc-950 pt-32 px-6 overflow-y-auto pb-40">
      <SubViewHeader title="Privacy & Security" onBack={onBack} />
      <div className="space-y-6">
        <div className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isBiometricEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-purple-500/20 text-purple-500'}`}>
              {isBiometricEnabled ? <Check size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <p className="font-bold">Biometric Login</p>
              <p className="text-xs text-zinc-400 mt-1">
                {isBiometricEnabled
                  ? 'Fingerprint/Face ID is enabled for your account.'
                  : 'Use Fingerprint or Face ID for faster, secure logins.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleEnableBiometrics}
            disabled={isBiometricEnabled || isAuthenticating}
            className={`w-full py-3 font-bold rounded-xl text-sm border transition-colors ${isBiometricEnabled
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 opacity-50 cursor-not-allowed'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30'
              }`}
          >
            {isAuthenticating ? 'Waiting for fingerprint...' : isBiometricEnabled ? 'Enabled' : 'Setup Fingerprint'}
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 mb-2">Data Sharing</h3>
          {sharingOptions.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 backdrop-blur-3xl bg-white/5 border border-white/10 rounded-2xl">
              <div className="pr-4">
                <p className="font-bold text-sm mb-0.5">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
              <div
                onClick={() => setDataSharing(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${dataSharing[item.id] ? 'bg-yellow-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${dataSharing[item.id] ? 'right-1 bg-black' : 'left-1 bg-zinc-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const NotificationsView = ({ user, onBack, syncSettings }) => {
  const [notifs, setNotifs] = useState(() => {
    if (user?.clientProfile?.pushNotifs) return user.clientProfile.pushNotifs;
    const saved = localStorage.getItem('pushNotifs');
    return saved ? JSON.parse(saved) : { ride: true, promo: false, alerts: true };
  });

  useEffect(() => {
    localStorage.setItem('pushNotifs', JSON.stringify(notifs));
    window.dispatchEvent(new Event('pushNotifsChanged'));
    if (syncSettings) syncSettings({ pushNotifs: notifs });
  }, [notifs]);

  const notifOptions = [
    { id: 'ride', title: 'Ride Updates', desc: 'Driver arrival, delays, and completions' },
    { id: 'promo', title: 'Promotions', desc: 'Discounts, special offers, and news' },
    { id: 'alerts', title: 'Account Alerts', desc: 'Security notices and important updates' }
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 z-50 bg-zinc-950 pt-32 px-6 overflow-y-auto pb-40">
      <SubViewHeader title="Notifications" onBack={onBack} />
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 mb-2">Push Notifications</h3>
          {notifOptions.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 backdrop-blur-3xl bg-white/5 border border-white/10 rounded-2xl">
              <div className="pr-4">
                <p className="font-bold text-sm mb-0.5">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
              <div
                onClick={() => setNotifs(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${notifs[item.id] ? 'bg-yellow-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${notifs[item.id] ? 'right-1 bg-black' : 'left-1 bg-zinc-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SupportView = ({ onBack }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    { q: 'How do I cancel a ride?', a: 'You can cancel a ride from the active ride screen by tapping the "Cancel" button before the driver arrives. Note that cancellation fees may apply after 3 minutes.' },
    { q: 'I lost an item in the cab', a: 'Tap on the ride in your History, then select "Report Lost Item" to securely contact your driver for the next 24 hours.' },
    { q: 'How do I apply a promo code?', a: 'Go to the ride booking screen, tap on "Promotions", and enter your code before confirming the ride.' },
    { q: 'Report a safety issue', a: 'Your safety is our priority. Use the SOS button during a ride, or contact our 24/7 safety hotline directly from the Help Center.' }
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 z-50 bg-zinc-950 pt-32 px-6 overflow-y-auto pb-40">
      <SubViewHeader title="Help Center" onBack={onBack} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => window.location.href = 'tel:+919876543210'}
            className="p-4 backdrop-blur-3xl bg-orange-500/10 border border-orange-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-orange-500/20 transition-colors"
          >
            <Smartphone size={24} className="text-orange-500" />
            <span className="font-bold text-sm">Call Us</span>
          </div>
          <div
            onClick={() => window.location.href = 'mailto:support@chardhogo.com'}
            className="p-4 backdrop-blur-3xl bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-blue-500/20 transition-colors"
          >
            <HelpCircle size={24} className="text-blue-500" />
            <span className="font-bold text-sm">Email Us</span>
          </div>
        </div>

        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 mb-2">FAQs</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                <span className="font-bold text-sm pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: expandedFaq === i ? 90 : 0 }}>
                  <ChevronRight size={16} className="text-zinc-500 shrink-0" />
                </motion.div>
              </div>
              <AnimatePresence>
                {expandedFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SettingsView = ({ user, onUpdateUser, onLogout }) => {
  const [activeSubView, setActiveSubView] = useState(localStorage.getItem('activeSubView') || null);

  useEffect(() => {
    if (activeSubView) {
      localStorage.setItem('activeSubView', activeSubView);
    } else {
      localStorage.removeItem('activeSubView');
    }
  }, [activeSubView]);

  const syncSettings = async (updates) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${config.AUTH_SERVICE}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && onUpdateUser) {
        onUpdateUser(data.data);
      }
    } catch (err) {
      console.error('Failed to sync settings:', err);
    }
  };

  const renderSubView = () => {
    switch (activeSubView) {
      case 'personal_info':
        return <PersonalInfoView user={user} onUpdateUser={onUpdateUser} onBack={() => setActiveSubView(null)} />;
      case 'security':
        return <SecurityView user={user} onBack={() => setActiveSubView(null)} syncSettings={syncSettings} />;
      case 'notifications':
        return <NotificationsView user={user} onBack={() => setActiveSubView(null)} syncSettings={syncSettings} />;
      case 'support':
        return <SupportView onBack={() => setActiveSubView(null)} />;
      default:
        return null;
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { id: 'personal_info', icon: <User size={18} />, label: 'Personal Information', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'security', icon: <Shield size={18} />, label: 'Privacy & Security', color: 'text-purple-500', bg: 'bg-purple-500/10' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'support', icon: <HelpCircle size={18} />, label: 'Help Center', color: 'text-orange-500', bg: 'bg-orange-500/10' },
      ]
    }
  ];

  return (
    <AnimatePresence mode="wait">
      {activeSubView === null && (
        <motion.div
          key="main"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute inset-0 z-40 bg-zinc-950 pt-32 px-6 overflow-y-auto pb-40"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2 tracking-tight">Settings</h1>
            <p className="text-zinc-400 font-medium">Manage your preferences</p>
          </div>

          {/* User Profile Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSubView('personal_info')}
            className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl mb-8 flex items-center gap-4 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-black font-black text-2xl uppercase shadow-lg shadow-yellow-500/20 overflow-hidden">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{user?.name || 'User'}</h2>
              <p className="text-sm text-zinc-400 truncate">{user?.email || 'user@example.com'}</p>
              <div className="inline-block mt-2 px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                {user?.role === 'client' ? 'User' : (user?.role || 'User')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <Edit2 size={16} className="text-zinc-500 group-hover:text-white" />
            </div>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 pl-2">{section.title}</h3>
                <div className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                  {section.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setActiveSubView(item.id)}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      className={`flex items-center gap-4 p-4 cursor-pointer ${i !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="flex-1 font-semibold text-sm">{item.label}</span>
                      <ChevronRight size={16} className="text-zinc-600" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-4 mt-8 bg-red-500/10 text-red-500 rounded-3xl font-bold uppercase tracking-widest text-sm border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {renderSubView()}

    </AnimatePresence>
  );
};

export default SettingsView;
