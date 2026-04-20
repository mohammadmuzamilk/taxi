import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Car, User, CheckCircle2, ChevronRight, ArrowLeft, Shield, Banknote, MapPin, Contact } from 'lucide-react';

const steps = [
  { id: 1, title: 'Profile', icon: <User size={16} /> },
  { id: 2, title: 'License', icon: <Shield size={16} /> },
  { id: 3, title: 'Govt ID', icon: <CheckCircle2 size={16} /> },
  { id: 4, title: 'Vehicle', icon: <Car size={16} /> },
  { id: 5, title: 'Payment', icon: <Banknote size={16} /> },
  { id: 6, title: 'Location', icon: <MapPin size={16} /> },
  { id: 7, title: 'Safety', icon: <Contact size={16} /> }
];

const DriverOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePhoto: null,
    
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: 'LMV',
    licenseFront: null,
    licenseBack: null,

    idType: 'AADHAAR',
    idNumber: '',
    idFront: null,
    idBack: null,

    vehicleType: 'car',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: '',
    vehicleYear: '',
    vehiclePhoto: null,

    pucDoc: null,

    bankAccount: '',
    ifscCode: '',
    upiId: '',

    city: '',
    preferredArea: '',
    availability: 'Full Time',

    selfDeclaration: false,
    emergencyContact: ''
  });

  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
    else onComplete({ ...formData, verificationStatus: 'DOCUMENTS_UPLOADED' });
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Upload failed: Only image files are allowed.');
        e.target.value = ''; // reset input
        return;
      }
      if (file.size > 800 * 1024) {
        alert('Upload failed: Image must be smaller than 800KB.');
        e.target.value = ''; // reset input
        return;
      }
      setFormData({...formData, [field]: file});
    }
  };

  const FileUpload = ({ label, field }) => (
    <label 
      className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden ${
          formData[field] ? 'border-yellow-500 bg-yellow-50' : 'border-zinc-200 bg-white hover:border-yellow-500 hover:bg-zinc-50'
      }`}
    >
      <input 
        type="file" 
        accept="image/*"
        className="hidden" 
        onChange={(e) => handleFileChange(e, field)} 
      />
      
      {/* If a file is uploaded, we can show a small preview background if we want, but keeping it simple below */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 z-10 ${
          formData[field] ? 'bg-yellow-500 text-black' : 'bg-zinc-100 text-zinc-400'
      }`}>
          {formData[field] ? <CheckCircle2 size={24} /> : <Upload size={24} />}
      </div>
      
      <p className="font-bold text-sm text-zinc-900 z-10 text-center px-2 line-clamp-1">
        {formData[field] ? formData[field].name : `Upload ${label}`}
      </p>
      
      {!formData[field] && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 z-10 mt-1">
          Max 800KB
        </p>
      )}
    </label>
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 px-6 pt-8 pb-10">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
            <button onClick={handleBack} className={`w-10 h-10 flex items-center justify-center bg-white rounded-full text-zinc-600 shadow-sm ${currentStep === 1 || currentStep === 8 ? 'invisible' : ''}`}>
                <ArrowLeft size={18} />
            </button>
            <div className="text-sm font-bold text-zinc-400 capitalize">Step {currentStep < 8 ? currentStep : 7} of 7</div>
            <div className="w-10 h-10 invisible" />
        </div>

        {currentStep < 8 && (
            <div className="flex items-center justify-between relative px-2 mb-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />
                <motion.div 
                    className="absolute top-1/2 left-0 h-0.5 bg-yellow-500 -translate-y-1/2 z-0"
                    animate={{ width: `${((currentStep - 1) / 6) * 100}%` }}
                />
                {steps.map((step) => (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            currentStep >= step.id ? 'bg-yellow-500 text-black shadow-md' : 'bg-white text-zinc-400 border border-zinc-200'
                        }`}>
                            {currentStep > step.id ? <CheckCircle2 size={14} /> : step.icon}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Identity & Profile</h2>
                <p className="text-sm text-zinc-500">Provide your basic identity details.</p>
              </div>
              <div className="space-y-4">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name (as per ID)</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </label>
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Email (Optional)</span>
                    <input type="email" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </label>
                <FileUpload label="Profile Photo (Selfie)" field="profilePhoto" />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Driver License</h2>
                <p className="text-sm text-zinc-500">Upload your valid driving license.</p>
              </div>
              <div className="space-y-4">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">License Number</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} />
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Expiry Date</span>
                        <input type="date" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.licenseExpiry} onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})} />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Type</span>
                        <select className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.licenseType} onChange={(e) => setFormData({...formData, licenseType: e.target.value})}>
                            <option value="LMV">LMV (Car)</option>
                            <option value="COMMERCIAL">Commercial</option>
                            <option value="2W">Two-Wheeler</option>
                        </select>
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FileUpload label="License Front" field="licenseFront" />
                  <FileUpload label="License Back" field="licenseBack" />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Government ID</h2>
                <p className="text-sm text-zinc-500">Required for background check and payouts.</p>
              </div>
              <div className="space-y-4">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">ID Type</span>
                    <select className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.idType} onChange={(e) => setFormData({...formData, idType: e.target.value})}>
                        <option value="AADHAAR">Aadhaar Card</option>
                        <option value="PAN">PAN Card</option>
                    </select>
                </label>
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">ID Number</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none" value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <FileUpload label="ID Front" field="idFront" />
                  <FileUpload label="ID Back" field="idBack" />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Vehicle Details</h2>
                <p className="text-sm text-zinc-500">What vehicle will you be driving?</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Vehicle Type</span>
                        <select className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}>
                            <option value="car">Car / Sedan</option>
                            <option value="auto">Auto Rickshaw</option>
                            <option value="bike">Bike / Moto</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Year</span>
                        <input type="number" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.vehicleYear} onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})} />
                    </label>
                </div>
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Model (e.g. Swift Dzire)</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.vehicleModel} onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})} />
                </label>
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Plate Number</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.vehiclePlate} onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})} />
                </label>
                <div>
                  <FileUpload label="Vehicle Photo" field="vehiclePhoto" />
                </div>
              </div>
            </motion.div>
          )}



          {currentStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Payment Details</h2>
                <p className="text-sm text-zinc-500">Where should we send your earnings?</p>
              </div>
              <div className="space-y-4">
                 <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Bank Account / UPI</span>
                    <input type="text" placeholder="Account Number or UPI ID" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.bankAccount} onChange={(e) => setFormData({...formData, bankAccount: e.target.value})} />
                </label>
                 <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">IFSC Code (If Bank)</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})} />
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Location Strategy</h2>
                <p className="text-sm text-zinc-500">Help us send you better rides.</p>
              </div>
              <div className="space-y-4">
                 <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">City</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </label>
                 <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Preferred Work Area</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.preferredArea} onChange={(e) => setFormData({...formData, preferredArea: e.target.value})} />
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Background Checks</h2>
                <p className="text-sm text-zinc-500">Final safety protocols before submission.</p>
              </div>
              <div className="space-y-4">
                 <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Emergency Contact Number</span>
                    <input type="text" className="w-full mt-1 p-3 bg-white border border-zinc-200 rounded-xl outline-none" value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} />
                </label>
                <div className="mt-4 bg-zinc-100 p-4 rounded-xl flex items-start space-x-3">
                    <input type="checkbox" className="mt-1 w-5 h-5 accent-yellow-500" checked={formData.selfDeclaration} onChange={(e) => setFormData({...formData, selfDeclaration: e.target.checked})} />
                    <p className="text-xs text-zinc-600 font-medium">
                        I hereby declare that all the information provided is true and I have no pending criminal records. I understand that misrepresentation may lead to immediate suspension.
                    </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-3 text-zinc-900">Under Review!</h1>
              <p className="text-zinc-500 text-sm font-medium px-4 mb-8 leading-relaxed">
                Your application has been sent to our verification team. This usually takes 24–48 hours. No rides can be picked up until admin approval.
              </p>
              
              <div className="w-full p-4 bg-zinc-100 rounded-2xl mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Next Step</p>
                  <p className="text-sm font-bold text-zinc-900">Once approved, open the Driver App to go online and start earning.</p>
              </div>

              <button 
                onClick={() => {
                  handleNext();
                  window.location.href = "http://localhost:5174"; // Redirects to Drivers app
                }}
                className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20"
              >
                Go to Driver App
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentStep < 8 && (
        <div className="mt-4">
          <button
            onClick={handleNext}
            disabled={currentStep === 7 && !formData.selfDeclaration}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all active:scale-95 ${
              (currentStep === 7 && !formData.selfDeclaration) 
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white shadow-xl shadow-zinc-200'
            }`}
          >
            <span>{currentStep === 7 ? 'Submit Application' : 'Continue'}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverOnboarding;
