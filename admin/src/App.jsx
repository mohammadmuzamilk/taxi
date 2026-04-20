import React, { useState } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, 
  MapPin, Shield, FileText, Car, CreditCard, 
  Search, Bell, MoreVertical, Check, X, AlertTriangle, Play, Settings, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock drivers based on the new schema structure
const DUMMY_DRIVERS = [
  {
    id: 'DRV-1001',
    authId: '65f2x9a',
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    email: 'rahul.s@example.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=1001',
    verificationStatus: 'UNDER_REVIEW', // REGISTERED, DOCUMENTS_UPLOADED, UNDER_REVIEW, APPROVED, REJECTED
    signupTimestamp: '2026-04-19T10:30:00Z',
    
    license: {
      number: 'DL-14202021192',
      expiryDate: '2030-05-12',
      type: 'LMV',
    },
    
    governmentId: {
      type: 'AADHAAR',
      number: 'XXXX-XXXX-4321',
    },

    vehicleDetails: {
      type: 'car',
      model: 'Maruti Suzuki Swift Dzire',
      plateNumber: 'DL 1C AB 1234',
      color: 'White',
      year: 2022
    },

    paymentDetails: {
      bankAccountNumber: 'XXXXX5678',
      ifscCode: 'HDFC0001234',
      upiId: 'rahul.taxi@upi'
    },

    locationDefaults: {
      city: 'Delhi',
      preferredArea: 'South Delhi',
      availability: 'Full Time'
    },

    backgroundInfo: {
      selfDeclaration: true
    },
    
    systemData: {
      deviceId: 'iphone-13-pro',
      ipLogs: ['192.168.1.1', '10.0.0.45']
    }
  },
  {
    id: 'DRV-1002',
    name: 'Vikram Singh',
    phone: '+91 8765432109',
    email: 'vikram.s@example.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=1002',
    verificationStatus: 'APPROVED',
    signupTimestamp: '2026-04-18T09:15:00Z',
    license: { number: 'RJ-14202123456', expiryDate: '2032-11-20', type: 'COMMERCIAL' },
    governmentId: { type: 'AADHAAR', number: 'XXXX-XXXX-9876' },
    vehicleDetails: { type: 'suv', model: 'Toyota Innova Crysta', plateNumber: 'RJ 14 CZ 9876', color: 'White', year: 2023 },
    locationDefaults: { city: 'Jaipur' },
    systemData: { deviceId: 'samsung-s23' }
  },
  {
    id: 'DRV-1003',
    name: 'Amit Patel',
    phone: '+91 7654321098',
    email: 'amit.p@example.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=1003',
    verificationStatus: 'REJECTED',
    signupTimestamp: '2026-04-17T14:45:00Z',
    rejectionReason: 'Blurry Driving License Photo. Please re-upload.',
    license: { number: 'GJ-01201987654', expiryDate: '2028-03-10', type: 'LMV' },
    governmentId: { type: 'PAN', number: 'ABCDE1234F' },
    vehicleDetails: { type: 'car', model: 'Honda City', plateNumber: 'GJ 01 XX 5432', color: 'Silver', year: 2021 },
    locationDefaults: { city: 'Ahmedabad' },
    systemData: { deviceId: 'oneplus-11' }
  }
];

// Badge component for Status
const StatusBadge = ({ status }) => {
  switch(status) {
    case 'UNDER_REVIEW':
      return <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max"><Clock size={12} className="mr-1.5" /> Pending Review</span>;
    case 'DOCUMENTS_UPLOADED':
      return <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max"><FileText size={12} className="mr-1.5" /> Docs Uploaded</span>;
    case 'APPROVED':
      return <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max"><CheckCircle2 size={12} className="mr-1.5" /> Approved</span>;
    case 'REJECTED':
      return <span className="bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max"><XCircle size={12} className="mr-1.5" /> Rejected</span>;
    default:
      return <span className="bg-zinc-500/10 text-zinc-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max">Registered</span>;
  }
};


export default function App() {
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Filter logic
  const filteredDrivers = DUMMY_DRIVERS.filter(d => {
    if (activeTab === 'PENDING') return ['DOCUMENTS_UPLOADED', 'UNDER_REVIEW'].includes(d.verificationStatus);
    if (activeTab === 'APPROVED') return d.verificationStatus === 'APPROVED';
    if (activeTab === 'REJECTED') return d.verificationStatus === 'REJECTED';
    return true; // ALL
  });

  // Handle Approve
  const handleApprove = () => {
    // API Call here...
    alert(`Driver ${selectedDriver.name} Approved!`);
    setSelectedDriver(null);
  };

  // Handle Reject
  const handleReject = () => {
    if(!noteText) { alert("Please provide a rejection reason in notes."); return; }
    // API Call here...
    alert(`Driver ${selectedDriver.name} Rejected with reason: ${noteText}`);
    setSelectedDriver(null);
  };


  return (
    <div className="min-h-screen bg-zinc-50 font-inter flex text-zinc-900">
      
      {/* ─── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-zinc-950 text-zinc-300 flex-col fixed inset-y-0 h-full border-r border-zinc-800 z-10 hidden md:flex">
         <div className="p-6 border-b border-zinc-800/80">
            <h1 className="text-xl font-black text-white italic tracking-tighter">CHARDHO<span className="text-yellow-500">GO</span></h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Admin Operations</p>
         </div>

         <div className="flex-1 py-6 px-4 space-y-1">
            <button className="w-full flex items-center space-x-3 bg-zinc-800/50 text-white px-4 py-3 rounded-xl transition-colors">
               <Users size={18} className="text-yellow-500" />
               <span className="font-semibold text-sm">Driver Verification</span>
            </button>
            <button className="w-full flex items-center space-x-3 hover:bg-zinc-800/30 px-4 py-3 rounded-xl transition-colors text-zinc-400">
               <Car size={18} />
               <span className="font-semibold text-sm">Active Rides</span>
            </button>
            <button className="w-full flex items-center space-x-3 hover:bg-zinc-800/30 px-4 py-3 rounded-xl transition-colors text-zinc-400">
               <CreditCard size={18} />
               <span className="font-semibold text-sm">Payouts</span>
            </button>
         </div>

         <div className="p-4 border-t border-zinc-800/80">
            <div className="flex items-center space-x-3 px-2">
               <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold">A</div>
               <div>
                  <p className="text-xs font-bold text-white">Admin Portal</p>
                  <p className="text-[10px] text-zinc-500 tracking-wider">Superadmin</p>
               </div>
            </div>
         </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
         
         {/* Topnav */}
         <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center text-xl font-black tracking-tight text-zinc-800">
               Driver Applications
            </div>
            <div className="flex items-center space-x-4">
               <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="text" placeholder="Search drivers by name, phone..." className="pl-9 pr-4 py-2 bg-zinc-100 hover:bg-zinc-200 focus:bg-white border border-transparent focus:border-zinc-300 rounded-lg text-sm font-medium w-64 transition-all outline-none" />
               </div>
               <button className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors">
                  <Bell size={18} />
               </button>
            </div>
         </header>

         {/* Content Area */}
         <div className="flex-1 overflow-auto p-8 bg-zinc-50/50">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6 mb-8">
               {[
                  { label: 'Total Pending', value: '42', icon: <Clock size={20} className="text-yellow-600" />, bg: 'bg-yellow-500/10' },
                  { label: 'Approved Today', value: '18', icon: <CheckCircle2 size={20} className="text-emerald-600" />, bg: 'bg-emerald-500/10' },
                  { label: 'Rejected Today', value: '3', icon: <XCircle size={20} className="text-red-600" />, bg: 'bg-red-500/10' },
                  { label: 'Total Active', value: '1,204', icon: <Car size={20} className="text-blue-600" />, bg: 'bg-blue-500/10' },
               ].map((stat, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
                        <p className="text-3xl font-black tracking-tight text-zinc-800">{stat.value}</p>
                     </div>
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                        {stat.icon}
                     </div>
                  </div>
               ))}
            </div>

            {/* List & Tabs */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[600px]">
               {/* Tabs */}
               <div className="flex px-6 border-b border-zinc-100">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
                     <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-6 text-xs font-bold tracking-widest uppercase transition-colors border-b-2 ${
                           activeTab === tab ? 'border-yellow-500 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               {/* Table */}
               <div className="overflow-auto flex-1">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-zinc-50 border-b border-zinc-100 sticky top-0 z-10">
                        <tr>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Driver</th>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Contact</th>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">City / Vehicle</th>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Date Applied</th>
                           <th className="px-6 py-4"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-100">
                        {filteredDrivers.map((driver) => (
                           <tr key={driver.id} className="hover:bg-zinc-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedDriver(driver)}>
                              <td className="px-6 py-4">
                                 <div className="flex items-center space-x-3">
                                    <img src={driver.profilePhoto} alt={driver.name} className="w-10 h-10 rounded-full object-cover bg-zinc-200" />
                                    <div>
                                       <p className="font-bold text-sm text-zinc-900 group-hover:text-yellow-600 transition-colors">{driver.name}</p>
                                       <p className="text-xs text-zinc-500 font-medium">{driver.id}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="text-sm font-medium text-zinc-700">{driver.phone}</p>
                                 <p className="text-xs text-zinc-400">{driver.email}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="text-sm font-medium text-zinc-700">{driver.locationDefaults?.city || 'N/A'}</p>
                                 <p className="text-xs text-zinc-400">{driver.vehicleDetails?.model || 'N/A'}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <StatusBadge status={driver.verificationStatus} />
                              </td>
                              <td className="px-6 py-4">
                                 <p className="text-sm font-medium text-zinc-700">{new Date(driver.signupTimestamp).toLocaleDateString()}</p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-zinc-400 hover:text-zinc-800 transition-colors">
                                    <MoreVertical size={16} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filteredDrivers.length === 0 && (
                     <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                           <Search size={24} />
                        </div>
                        <p className="text-lg font-bold text-zinc-800">No applications found</p>
                        <p className="text-zinc-500 text-sm">Under the '{activeTab}' category.</p>
                     </div>
                  )}
               </div>
            </div>

         </div>
      </main>

      {/* ─── MODAL: DRIVER DETAILS ────────────────────────────────────────── */}
      <AnimatePresence>
         {selectedDriver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ overflow: 'hidden' }}>
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                  onClick={() => setSelectedDriver(null)}
               />
               <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="relative bg-white w-full max-w-5xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
               >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 bg-zinc-50/50">
                     <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">Application Review</h2>
                        <StatusBadge status={selectedDriver.verificationStatus} />
                     </div>
                     <button onClick={() => setSelectedDriver(null)} className="w-10 h-10 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  {/* Modal Body - Scrollable grid */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* COLUMN 1: Profile & Identity */}
                        <div className="space-y-8">
                           {/* Primary Details */}
                           <div>
                              <div className="flex items-center space-x-4 mb-4">
                                 <img src={selectedDriver.profilePhoto} alt="" className="w-20 h-20 rounded-2xl object-cover bg-zinc-100 border border-zinc-200" />
                                 <div>
                                    <h3 className="text-2xl font-black tracking-tight text-zinc-800">{selectedDriver.name}</h3>
                                    <p className="text-sm font-medium text-zinc-500">{selectedDriver.id} • {selectedDriver.locationDefaults.city}</p>
                                 </div>
                              </div>
                              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-3">
                                 <div className="flex items-center text-sm"><span className="text-zinc-500 w-16">Phone:</span> <span className="font-bold text-zinc-800">{selectedDriver.phone} <span className="text-[10px] text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase">OTP Verified</span></span></div>
                                 <div className="flex items-center text-sm"><span className="text-zinc-500 w-16">Email:</span> <span className="font-bold text-zinc-800">{selectedDriver.email || 'N/A'}</span></div>
                                 <div className="flex items-center text-sm"><span className="text-zinc-500 w-16">Joined:</span> <span className="font-medium text-zinc-800">{new Date(selectedDriver.signupTimestamp).toLocaleDateString()}</span></div>
                              </div>
                           </div>

                           {/* Government ID & License Text */}
                           <div>
                              <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-zinc-400 mb-3"><Shield size={14} className="mr-1.5" /> Identity Docs</h4>
                              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-4">
                                 <div>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Govt ID ({selectedDriver.governmentId.type})</p>
                                    <p className="text-sm font-black tracking-wider text-zinc-800">{selectedDriver.governmentId.number}</p>
                                 </div>
                                 <div className="w-full h-px bg-blue-100/50"></div>
                                 <div>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Driving License ({selectedDriver.license.type})</p>
                                    <p className="text-sm font-black tracking-wider text-zinc-800">{selectedDriver.license.number}</p>
                                    <p className="text-xs text-zinc-500 font-medium">Expires: {new Date(selectedDriver.license.expiryDate).toLocaleDateString()}</p>
                                 </div>
                              </div>
                           </div>
                           
                           {/* Payment & Security */}
                           <div>
                              <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-zinc-400 mb-3"><CreditCard size={14} className="mr-1.5" /> Payout Info</h4>
                              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bank Acc / UPI</p>
                                 <p className="text-sm font-bold text-zinc-800 mb-1">{selectedDriver.paymentDetails.bankAccountNumber || selectedDriver.paymentDetails.upiId}</p>
                                 <p className="text-xs text-zinc-500 font-medium">IFSC: {selectedDriver.paymentDetails.ifscCode || 'N/A'}</p>
                              </div>
                           </div>
                        </div>

                        {/* COLUMN 2: Images Review (Crucial for Admin) */}
                        <div className="lg:col-span-2 space-y-6">
                           
                           {/* Vehicle Specs */}
                           <div>
                              <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-zinc-400 mb-3"><Car size={14} className="mr-1.5" /> Vehicle Overview</h4>
                              <div className="flex items-center space-x-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                 <div className="w-16 h-16 bg-zinc-200 rounded-xl flex items-center justify-center shrink-0">
                                    <Car size={24} className="text-zinc-500" />
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">{selectedDriver.vehicleDetails.type}</p>
                                    <p className="text-lg font-black text-zinc-800">{selectedDriver.vehicleDetails.model} ({selectedDriver.vehicleDetails.year || 'N/A'})</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plate #</p>
                                    <p className="text-base font-black tracking-widest text-zinc-800 bg-white border-2 border-zinc-200 px-3 py-1 rounded mt-1 shadow-sm">{selectedDriver.vehicleDetails.plateNumber}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Image Previews (Mock Placeholders) */}
                           <div>
                              <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-zinc-400 mb-3"><FileText size={14} className="mr-1.5" /> Document Viewer</h4>
                              <div className="grid grid-cols-2 gap-4">
                                 {[
                                    { title: 'License Front', desc: 'Verify name, DOB & expiry' },
                                    { title: 'Govt ID Front', desc: 'Aadhaar / PAN Match' },
                                    { title: 'Vehicle Photo', desc: 'Front + Plate visible' },
                                 ].map((doc, idx) => (
                                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-100 cursor-pointer">
                                       {/* Placeholder image representation */}
                                       <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 group-hover:scale-105 transition-transform duration-500">
                                          <Shield size={32} className="opacity-20 mb-2" />
                                          <p className="font-bold text-sm text-zinc-600">{doc.title}</p>
                                          <p className="text-[10px] uppercase font-bold tracking-widest">{doc.desc}</p>
                                       </div>
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                          <div className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-y-0 translate-y-4">
                                             <Search size={18} className="text-zinc-800" />
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                        </div>
                     </div>
                  </div>

                  {/* Modal Footer / Action Bar */}
                  <div className="border-t border-zinc-100 p-6 bg-zinc-50 flex flex-col sm:flex-row items-end sm:items-center justify-between shrink-0">
                     <div className="w-full sm:w-auto flex-1 max-w-xl mr-0 sm:mr-8 mb-4 sm:mb-0">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Admin Notes / Rejection Reason</label>
                        <input 
                           type="text" 
                           placeholder="Type notes here... Required if rejecting." 
                           value={noteText}
                           onChange={(e) => setNoteText(e.target.value)}
                           className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow"
                        />
                     </div>
                     <div className="flex space-x-3 shrink-0 w-full sm:w-auto">
                        {['UNDER_REVIEW', 'DOCUMENTS_UPLOADED'].includes(selectedDriver.verificationStatus) && (
                           <>
                              <button onClick={handleReject} className="flex-1 sm:flex-none px-6 py-3 font-bold text-sm text-red-600 bg-red-100 hover:bg-red-200 rounded-xl transition-colors flex items-center justify-center">
                                 <XCircle size={18} className="mr-2" /> Reject
                              </button>
                              <button onClick={handleApprove} className="flex-1 sm:flex-none px-8 py-3 font-bold text-sm text-black bg-yellow-500 hover:bg-yellow-400 border border-yellow-400/50 shadow-[0_8px_20px_rgba(234,179,8,0.3)] rounded-xl transition-all cursor-pointer flex items-center justify-center">
                                 <CheckCircle2 size={18} className="mr-2" /> Approve Driver
                              </button>
                           </>
                        )}
                        {selectedDriver.verificationStatus === 'REJECTED' && (
                           <div className="px-6 py-3 font-bold text-sm text-red-600 bg-red-100 border border-red-200 rounded-xl flex items-center">
                              <AlertTriangle size={18} className="mr-2" /> Application Rejected
                           </div>
                        )}
                        {selectedDriver.verificationStatus === 'APPROVED' && (
                           <div className="px-6 py-3 font-bold text-sm text-emerald-600 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center">
                              <CheckCircle2 size={18} className="mr-2" /> Application Approved
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
