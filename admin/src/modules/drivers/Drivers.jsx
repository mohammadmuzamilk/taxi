import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/adminApi';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  X,
  FileText,
  Car,
  User,
  CreditCard,
  Phone,
  MapPin,
  Star,
  AlertTriangle,
} from 'lucide-react';

// ─── Document Image Card ───────────────────────────────────────────────────────
const DocImage = ({ label, url }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    {url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={label}
          className="w-full h-36 object-cover rounded-xl border border-slate-100 hover:opacity-90 hover:scale-[1.01] transition-all cursor-zoom-in"
        />
      </a>
    ) : (
      <div className="w-full h-36 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-300">
        <FileText size={24} />
        <span className="text-[10px] font-bold">Not Uploaded</span>
      </div>
    )}
  </div>
);

// ─── Driver Detail Modal ───────────────────────────────────────────────────────
const DriverModal = ({ driver, onClose, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!driver) return null;

  const handleApprove = async () => {
    setActionLoading(true);
    await onApprove(driver.id);
    setActionLoading(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setShowRejectInput(true);
      return;
    }
    setActionLoading(true);
    await onReject(driver.id, rejectionReason);
    setActionLoading(false);
    onClose();
  };

  const statusColor = {
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    DOCUMENTS_UPLOADED: 'bg-amber-100 text-amber-700',
    REGISTERED: 'bg-slate-100 text-slate-600',
  }[driver.verificationStatus] || 'bg-slate-100 text-slate-600';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="bg-white h-screen w-full max-w-2xl overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-black text-slate-900">Driver Verification</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Profile Section */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
              {driver.profilePhoto ? (
                <img src={driver.profilePhoto} alt={driver.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-400">
                  {driver.name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-black text-slate-900">{driver.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${statusColor}`}>
                  {driver.verificationStatus}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Phone size={14} /> {driver.phone}
                </div>
                {driver.email && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <User size={14} /> {driver.email}
                  </div>
                )}
                {driver.city && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin size={14} /> {driver.city}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Star size={14} className="text-amber-400" /> {driver.rating} Rating
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
              <Car size={16} /> Vehicle Details
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Type</p>
                <p className="font-bold text-slate-900">{driver.vehicleType || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Model</p>
                <p className="font-bold text-slate-900">{driver.vehicleModel || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Plate</p>
                <p className="font-bold text-slate-900 uppercase">{driver.vehiclePlate || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Color</p>
                <p className="font-bold text-slate-900">{driver.vehicleColor || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Year</p>
                <p className="font-bold text-slate-900">{driver.vehicleYear || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Availability</p>
                <p className="font-bold text-slate-900">{driver.availability || '—'}</p>
              </div>
            </div>
          </div>

          {/* License & ID Info */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
              <CreditCard size={16} /> License & Identity
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">License Number</p>
                <p className="font-bold text-slate-900">{driver.licenseNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Expiry Date</p>
                <p className="font-bold text-slate-900">
                  {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{driver.govIdType || 'Gov ID'} Number</p>
                <p className="font-bold text-slate-900">{driver.govIdNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Preferred Area</p>
                <p className="font-bold text-slate-900">{driver.preferredArea || '—'}</p>
              </div>
            </div>
          </div>

          {/* Bank & Payment Info */}
          <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50 space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-black text-indigo-700 uppercase tracking-wider">
              <CreditCard size={16} /> Payment Details
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="col-span-2">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Account Holder</p>
                <p className="font-bold text-indigo-900">{driver.bankDetail?.accountHolder || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Account Number</p>
                <p className="font-bold text-indigo-900 font-mono tracking-tight">{driver.bankDetail?.accountNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">IFSC Code</p>
                <p className="font-bold text-indigo-900 uppercase">{driver.bankDetail?.ifscCode || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">UPI ID</p>
                <p className="font-bold text-indigo-900">{driver.bankDetail?.upiId || '—'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider mb-4">
              <FileText size={16} /> Documents Proof
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <DocImage label="Driver's License (Front)" url={driver.licenseFrontImage} />
              <DocImage label="Driver's License (Back)" url={driver.licenseBackImage} />
              <DocImage label={`${driver.govIdType || 'Gov ID'} (Front)`} url={driver.govIdFrontImage} />
              <DocImage label={`${driver.govIdType || 'Gov ID'} (Back)`} url={driver.govIdBackImage} />
              <DocImage label="Aadhaar Card" url={driver.docAadhaar} />
              <DocImage label="PAN Card" url={driver.docPan} />
              <DocImage label="Registration Certificate (RC)" url={driver.docRC} />
              <DocImage label="Vehicle Appearance" url={driver.vehiclePhoto} />
            </div>
          </div>

          {/* Emergency & Background */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
              <AlertTriangle size={16} /> Safety & Background
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Emergency Contact</p>
                <p className="font-bold text-slate-900">{driver.emergencyContact || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Self Declaration</p>
                <p className={`font-bold ${driver.selfDeclaration ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {driver.selfDeclaration ? 'Clean Record Verified' : 'Declaration Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason (if already rejected) */}
          {driver.verificationStatus === 'REJECTED' && driver.rejectionReason && (
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
              <h4 className="flex items-center gap-2 text-sm font-black text-rose-700 uppercase tracking-wider mb-2">
                <AlertTriangle size={16} /> Rejection Reason
              </h4>
              <p className="text-sm text-rose-600">{driver.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {driver.verificationStatus !== 'APPROVED' && driver.verificationStatus !== 'REJECTED' && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 space-y-3">
            {showRejectInput && (
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection (required)..."
                className="w-full p-3 border border-rose-200 bg-rose-50 rounded-xl text-sm focus:ring-2 focus:ring-rose-300 outline-none resize-none"
                rows={2}
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-black rounded-xl hover:bg-rose-100 transition-colors border border-rose-200 disabled:opacity-50"
              >
                <XCircle size={18} />
                {showRejectInput && rejectionReason ? 'Confirm Reject' : 'Reject Driver'}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                Approve Driver
              </button>
            </div>
          </div>
        )}

        {/* Re-review footer for approved/rejected */}
        {(driver.verificationStatus === 'APPROVED' || driver.verificationStatus === 'REJECTED') && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5">
            <div className="flex gap-3">
              {driver.verificationStatus === 'APPROVED' && (
                <button
                  onClick={() => { setShowRejectInput(true); handleReject(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-black rounded-xl hover:bg-rose-100 transition-colors border border-rose-200"
                >
                  <XCircle size={18} /> Suspend Driver
                </button>
              )}
              {driver.verificationStatus === 'REJECTED' && (
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 size={18} /> Re-Approve Driver
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Drivers Page ─────────────────────────────────────────────────────────
const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDrivers = async () => {
    try {
      const response = await adminApi.getDrivers();
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(); // eslint-disable-line
  }, []);

  const handleApprove = async (driverId) => {
    try {
      await adminApi.updateDriverStatus({ driverId, status: 'APPROVED' });
      fetchDrivers();
    } catch {
      alert('Failed to approve driver');
    }
  };

  const handleReject = async (driverId, rejectionReason) => {
    try {
      await adminApi.updateDriverStatus({ driverId, status: 'REJECTED', rejectionReason });
      fetchDrivers();
    } catch {
      alert('Failed to reject driver');
    }
  };

  const filtered = drivers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.phone?.includes(search) ||
    d.vehiclePlate?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading drivers...</div>;

  return (
    <>
      {selectedDriver && (
        <DriverModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Manage Drivers
            <span className="ml-3 text-base font-medium text-slate-400">({drivers.length} total)</span>
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search drivers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No drivers found.
                  </td>
                </tr>
              )}
              {filtered.map((driver) => (
                <tr
                  key={driver.id}
                  className="hover:bg-yellow-50/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedDriver(driver)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0">
                        {driver.profilePhoto ? (
                          <img src={driver.profilePhoto} alt={driver.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                            {driver.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{driver.name}</p>
                        <p className="text-xs text-slate-500">{driver.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{driver.vehicleModel || '—'}</p>
                    <p className="text-xs text-slate-500 uppercase font-semibold">{driver.vehiclePlate || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      driver.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      driver.verificationStatus === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {driver.verificationStatus === 'APPROVED' && <ShieldCheck size={12} />}
                      {driver.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900">{driver.rating}</span>
                      <span className="text-amber-400">★</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {driver.verificationStatus !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprove(driver.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Quick Approve"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      {driver.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleReject(driver.id, 'Rejected by admin')}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Quick Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="px-3 py-1.5 text-xs font-bold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                      >
                        View Docs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Drivers;
