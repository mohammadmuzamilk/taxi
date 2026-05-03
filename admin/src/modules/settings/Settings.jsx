import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { Save, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const fetchSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      setSettings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings(); // eslint-disable-line
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await adminApi.updateSettings(settings);
      setSettings(response.data.data);
      setMessage({ type: 'success', text: 'Settings updated successfully! Changes are applied instantly.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please verify inputs.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value, type = 'number') => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: type === 'number' ? parseFloat(value) : value,
      },
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading System Settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure global platform rules. Changes are emitted via Socket.io instantly.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FARE RULES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Fare & Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Fare (₹)</label>
              <input type="number" value={settings?.fare?.baseFare || 0} onChange={(e) => handleChange('fare', 'baseFare', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Per KM Rate (₹)</label>
              <input type="number" value={settings?.fare?.perKmRate || 0} onChange={(e) => handleChange('fare', 'perKmRate', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Per Min Rate (₹)</label>
              <input type="number" value={settings?.fare?.perMinuteRate || 0} onChange={(e) => handleChange('fare', 'perMinuteRate', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cancel Fee (₹)</label>
              <input type="number" value={settings?.fare?.cancellationFee || 0} onChange={(e) => handleChange('fare', 'cancellationFee', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surge Multiplier (x)</label>
              <input type="number" step="0.1" value={settings?.fare?.surgeMultiplier || 1} onChange={(e) => handleChange('fare', 'surgeMultiplier', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
          </div>
        </div>

        {/* COMMISSION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Revenue Split</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Cut (%)</label>
              <input type="number" value={settings?.commission?.adminPercent || 0} onChange={(e) => handleChange('commission', 'adminPercent', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Driver Cut (%)</label>
              <input type="number" value={settings?.commission?.driverPercent || 0} onChange={(e) => handleChange('commission', 'driverPercent', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-start gap-2 mt-4">
            <ShieldAlert size={16} className="text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-800 font-medium">Ensure the total equals 100%. Incorrect values may cause payment settlement errors.</p>
          </div>
        </div>

        {/* RIDE RULES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Ride Constraints</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Distance (KM)</label>
              <input type="number" value={settings?.rideRules?.maxDistance || 0} onChange={(e) => handleChange('rideRules', 'maxDistance', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search Timeout (s)</label>
              <input type="number" value={settings?.rideRules?.rideTimeout || 0} onChange={(e) => handleChange('rideRules', 'rideTimeout', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Driver Idle Auto-Cancel (mins)</label>
              <input type="number" value={settings?.rideRules?.autoCancelTime || 0} onChange={(e) => handleChange('rideRules', 'autoCancelTime', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
          </div>
        </div>

        {/* DRIVER RULES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Driver Operations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Cancels/Day</label>
              <input type="number" value={settings?.driverRules?.maxCancellation || 0} onChange={(e) => handleChange('driverRules', 'maxCancellation', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Rating allowed</label>
              <input type="number" step="0.1" value={settings?.driverRules?.minRating || 0} onChange={(e) => handleChange('driverRules', 'minRating', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-slate-700">Auto-Approve Verified Docs</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings?.driverRules?.autoApprove || false} onChange={(e) => handleChange('driverRules', 'autoApprove', e.target.checked, 'boolean')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
            </label>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Payment Methods</h2>
          <div className="space-y-3">
            {[
              { label: 'Enable Cash Payments', key: 'enableCash' },
              { label: 'Enable UPI Payments', key: 'enableUPI' },
              { label: 'Enable Card Payments', key: 'enableCard' },
            ].map((method) => (
              <div key={method.key} className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{method.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings?.payment?.[method.key] || false} onChange={(e) => handleChange('payment', method.key, e.target.checked, 'boolean')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Global Features</h2>
          <div className="space-y-3">
            {[
              { label: 'Dynamic Surge Pricing', key: 'surgeEnabled' },
              { label: 'Scheduled Rides', key: 'schedulingEnabled' },
              { label: 'Promo Codes & Discounts', key: 'promocodeEnabled' },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{feature.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings?.features?.[feature.key] || false} onChange={(e) => handleChange('features', feature.key, e.target.checked, 'boolean')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
};

export default Settings;
