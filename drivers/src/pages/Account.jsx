import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Car, Star, Phone, Mail, CreditCard, MapPin,
  Edit3, Check, X, ChevronRight, Shield, Banknote,
  AlertCircle, Loader2, LogOut, RefreshCw, Hash, Palette
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

// ─── Reusable field row ───────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const InfoRow = ({ icon: Icon, label, value, accent = false }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-3">
      <Icon size={15} className="text-zinc-500 shrink-0" />
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
    </div>
    <span className={`text-sm font-black text-right max-w-[55%] truncate ${accent ? 'text-yellow-400' : 'text-white'}`}>
      {value || <span className="text-zinc-600 italic font-medium text-xs">Not set</span>}
    </span>
  </div>
);

// ─── Editable input ───────────────────────────────────────────────────────────
const EditInput = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="mb-4">
    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || label}
      className="w-full bg-zinc-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow-500/50 focus:bg-zinc-800 transition-all placeholder:text-zinc-600"
    />
  </div>
);

// ─── Section card ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const Section = ({ title, icon: Icon, iconColor = 'text-zinc-400', children }) => (
  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden mb-4">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5">
      <Icon size={16} className={iconColor} />
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">{title}</h3>
    </div>
    <div className="px-5 pb-2 pt-1">{children}</div>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    APPROVED:          { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Approved' },
    UNDER_REVIEW:      { color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',   label: 'Under Review' },
    REJECTED:          { color: 'bg-red-500/15 text-red-400 border-red-500/20',            label: 'Rejected' },
    DOCUMENTS_UPLOADED:{ color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',         label: 'Docs Uploaded' },
    REGISTERED:        { color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',         label: 'Registered' },
  };
  const s = map[status] || map.REGISTERED;
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${s.color}`}>
      {s.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const Account = ({ user: propUser, onLogout }) => {
  const [profile, setProfile]       = useState(propUser || null);
  const [loading, setLoading]       = useState(!propUser);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [editMode, setEditMode]     = useState(false);
  const [totalTrips, setTotalTrips] = useState(null);

  // ── Edit form state ───────────────────────────────────────────────────────
  const [form, setForm] = useState({});

  // ── Helpers ───────────────────────────────────────────────────────────────
  const token = localStorage.getItem('driverToken');

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch profile and earnings in parallel
      const [profileRes, earningsRes] = await Promise.all([
        fetch(`${API_URL}/api/drivers/profile`,  { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/drivers/earnings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const profileData  = await profileRes.json();
      const earningsData = await earningsRes.json();

      if (profileData.success) {
        setProfile(profileData.data);
      } else {
        setError(profileData.error || 'Failed to load profile');
      }
      if (earningsData.success) {
        setTotalTrips(earningsData.data?.totalTrips ?? 0);
      }
    } catch {
      setError('Connection error. Check your network.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (!propUser) fetchProfile(); // eslint-disable-line
    else setProfile(propUser); // eslint-disable-line
  }, [propUser, fetchProfile]);

  // Populate form when entering edit mode
  useEffect(() => {
    if (editMode && profile) {
      // eslint-disable-next-line
      setForm({
        name:    profile.name || '',
        email:   profile.email || '',
        // vehicle
        vehicleModel:    profile.vehicleModel || profile.vehicle?.model || profile.vehicleDetails?.model || '',
        vehiclePlate:    profile.vehiclePlate || profile.vehicle?.plateNumber || profile.vehicleDetails?.plateNumber || '',
        vehicleColor:    profile.vehicleColor || profile.vehicle?.color || profile.vehicleDetails?.color || '',
        vehicleType:     profile.vehicleType || profile.vehicle?.type || profile.vehicleDetails?.type || '',
        // payment
        bankAccount:     profile.bankDetail?.accountNumber || profile.paymentDetails?.bankAccountNumber || '',
        ifsc:            profile.bankDetail?.ifscCode || profile.paymentDetails?.ifscCode || '',
        accountHolder:   profile.bankDetail?.accountHolder || profile.paymentDetails?.accountHolderName || '',
        upiId:           profile.bankDetail?.upiId || profile.paymentDetails?.upiId || '',
        // location
        city:            profile.city || profile.locationDefaults?.city || '',
        preferredArea:   profile.preferredArea || profile.locationDefaults?.preferredArea || '',
        // emergency
        emergencyContact: profile.emergencyContact || profile.backgroundInfo?.emergencyContact || '',
      });
    }
  }, [editMode, profile]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name:  form.name,
        email: form.email,
        vehicle: {
          model:       form.vehicleModel,
          plateNumber: form.vehiclePlate,
          color:       form.vehicleColor,
          type:        form.vehicleType,
        },
        vehicleDetails: {
          model:       form.vehicleModel,
          plateNumber: form.vehiclePlate,
          color:       form.vehicleColor,
          type:        form.vehicleType?.toLowerCase(),
        },
        paymentDetails: {
          bankAccountNumber: form.bankAccount,
          ifscCode:          form.ifsc,
          accountHolderName: form.accountHolder,
          upiId:             form.upiId,
        },
        locationDefaults: {
          city:          form.city,
          preferredArea: form.preferredArea,
        },
        backgroundInfo: {
          emergencyContact: form.emergencyContact,
        },
      };

      const res  = await fetch(`${API_URL}/api/drivers/profile`, {
        method:  'PUT',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setProfile(data.data);
        setEditMode(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3500);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    else window.location.reload();
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full bg-zinc-950 flex flex-col items-center justify-center gap-4 pb-24">
        <Loader2 size={32} className="text-yellow-500 animate-spin" />
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Loading Profile…</p>
      </div>
    );
  }

  const p = profile || {};
  const vehicle = {
    model: p.vehicleModel || p.vehicle?.model || p.vehicleDetails?.model,
    plateNumber: p.vehiclePlate || p.vehicle?.plateNumber || p.vehicleDetails?.plateNumber,
    color: p.vehicleColor || p.vehicle?.color || p.vehicleDetails?.color,
    type: p.vehicleType || p.vehicle?.type || p.vehicleDetails?.type
  };
  const payment = {
    accountHolderName: p.bankDetail?.accountHolder || p.paymentDetails?.accountHolderName,
    bankAccountNumber: p.bankDetail?.accountNumber || p.paymentDetails?.bankAccountNumber,
    ifscCode: p.bankDetail?.ifscCode || p.paymentDetails?.ifscCode,
    upiId: p.bankDetail?.upiId || p.paymentDetails?.upiId,
  };
  const location = {
    city: p.city || p.locationDefaults?.city,
    preferredArea: p.preferredArea || p.locationDefaults?.preferredArea,
    availability: p.availability || p.locationDefaults?.availability
  };
  const bg = {
    emergencyContact: p.emergencyContact || p.backgroundInfo?.emergencyContact
  };

  // ── EDIT MODE ─────────────────────────────────────────────────────────────
  if (editMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full bg-zinc-950 overflow-y-auto pb-28"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-14 pb-6">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter">EDIT PROFILE</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5">Update your details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10"
            >
              <X size={18} className="text-zinc-400" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="text-black animate-spin" /> : <Check size={18} className="text-black" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-xs font-bold">{error}</p>
          </div>
        )}

        <div className="px-6 space-y-1">
          {/* Personal */}
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Personal Info</p>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 mb-5">
            <EditInput label="Full Name"    value={form.name}  onChange={v => setForm(f => ({ ...f, name: v }))}  placeholder="Your full name" />
            <EditInput label="Email"        value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="your@email.com" />
            <EditInput label="Emergency Contact" value={form.emergencyContact} onChange={v => setForm(f => ({ ...f, emergencyContact: v }))} placeholder="+91 00000 00000" />
          </div>

          {/* Vehicle */}
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Vehicle Details</p>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 mb-5">
            <EditInput label="Vehicle Model"    value={form.vehicleModel} onChange={v => setForm(f => ({ ...f, vehicleModel: v }))} placeholder="e.g. Maruti Swift" />
            <EditInput label="Plate Number"     value={form.vehiclePlate} onChange={v => setForm(f => ({ ...f, vehiclePlate: v }))} placeholder="e.g. DL01AB1234" />
            <EditInput label="Color"            value={form.vehicleColor} onChange={v => setForm(f => ({ ...f, vehicleColor: v }))} placeholder="e.g. White" />
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Vehicle Type</label>
              <select
                value={form.vehicleType || ''}
                onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
                className="w-full bg-zinc-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow-500/50 transition-all"
              >
                <option value="">Select type</option>
                {['Bike', 'Auto', 'Car', 'SUV'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Payment */}
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Payment Details</p>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 mb-5">
            <EditInput label="Account Holder Name" value={form.accountHolder} onChange={v => setForm(f => ({ ...f, accountHolder: v }))} placeholder="Name on bank account" />
            <EditInput label="Bank Account Number"  value={form.bankAccount}   onChange={v => setForm(f => ({ ...f, bankAccount: v }))}   placeholder="Account number" />
            <EditInput label="IFSC Code"            value={form.ifsc}          onChange={v => setForm(f => ({ ...f, ifsc: v }))}          placeholder="e.g. HDFC0001234" />
            <EditInput label="UPI ID"               value={form.upiId}         onChange={v => setForm(f => ({ ...f, upiId: v }))}         placeholder="yourname@upi" />
          </div>

          {/* Location */}
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Location Preferences</p>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 mb-5">
            <EditInput label="City"           value={form.city}          onChange={v => setForm(f => ({ ...f, city: v }))}          placeholder="e.g. Delhi" />
            <EditInput label="Preferred Area" value={form.preferredArea} onChange={v => setForm(f => ({ ...f, preferredArea: v }))} placeholder="e.g. Connaught Place" />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-yellow-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Check size={18} /> Save Changes</>}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── VIEW MODE ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-zinc-950 overflow-y-auto pb-28"
    >
      {/* ── Toast notifications ── */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-50 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <Check size={16} className="text-emerald-400 shrink-0" />
            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">{success}</p>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-50 bg-red-500/15 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-xs font-black uppercase tracking-widest">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Profile hero ── */}
      <div className="relative px-6 pt-14 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-linear-to-br from-yellow-500/20 to-orange-500/10 rounded-3xl border border-yellow-500/20 flex items-center justify-center">
                <User size={36} className="text-yellow-500" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-950 ${p.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{p.name || 'Driver'}</h2>
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-0.5">{p.phone}</p>
              <div className="mt-2">
                <StatusBadge status={p.verificationStatus} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={fetchProfile}
              className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center border border-white/10 active:scale-95"
            >
              <RefreshCw size={14} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center active:scale-95"
            >
              <Edit3 size={14} className="text-yellow-400" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-1">
          {[
            { label: 'Rating',  value: p.rating ? Number(p.rating).toFixed(1) : '5.0', unit: '★' },
            { label: 'Status',  value: p.status === 'online' ? 'Online' : 'Offline', unit: '' },
            { label: 'Trips',   value: totalTrips !== null ? totalTrips.toString() : '…', unit: '' },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 text-center">
              <p className="text-lg font-black text-yellow-400">{s.unit}{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6">
        {/* Personal Info */}
        <Section title="Personal Info" icon={User} iconColor="text-blue-400">
          <InfoRow icon={Mail}   label="Email"  value={p.email} />
          <InfoRow icon={Phone}  label="Phone"  value={p.phone} />
          <InfoRow icon={Shield} label="Govt ID Type" value={p.governmentId?.type} />
          <InfoRow icon={Hash}   label="Licence No."  value={p.license?.number} />
          <InfoRow icon={Phone}  label="Emergency"    value={bg.emergencyContact} />
        </Section>

        {/* Vehicle */}
        <Section title="Vehicle Details" icon={Car} iconColor="text-yellow-400">
          <InfoRow icon={Car}     label="Model"  value={vehicle.model} />
          <InfoRow icon={Hash}    label="Plate"  value={vehicle.plateNumber} accent />
          <InfoRow icon={Palette} label="Color"  value={vehicle.color} />
          <InfoRow icon={Car}     label="Type"   value={vehicle.type} />
        </Section>

        {/* Payment */}
        <Section title="Payment Details" icon={Banknote} iconColor="text-emerald-400">
          <InfoRow icon={User}       label="Account Holder" value={payment.accountHolderName} />
          <InfoRow icon={CreditCard} label="Bank Account"   value={payment.bankAccountNumber ? `••••${payment.bankAccountNumber.slice(-4)}` : null} />
          <InfoRow icon={Hash}       label="IFSC"           value={payment.ifscCode} />
          <InfoRow icon={CreditCard} label="UPI"            value={payment.upiId} />
        </Section>

        {/* Location */}
        <Section title="Location Preferences" icon={MapPin} iconColor="text-pink-400">
          <InfoRow icon={MapPin} label="City"           value={location.city} />
          <InfoRow icon={MapPin} label="Preferred Area" value={location.preferredArea} />
          <InfoRow icon={Star}   label="Availability"   value={location.availability} />
        </Section>

        {/* Edit CTA */}
        <button
          onClick={() => setEditMode(true)}
          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs text-white flex items-center justify-center gap-2 mb-3 active:scale-[0.98] transition-transform"
        >
          <Edit3 size={14} />
          Edit Profile
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <LogOut size={14} />
          Log Out
        </button>

        <p className="text-center text-zinc-700 text-[10px] font-bold uppercase tracking-widest mt-6 mb-2">
          Chardho Go Driver v1.0
        </p>
      </div>
    </motion.div>
  );
};

export default Account;
