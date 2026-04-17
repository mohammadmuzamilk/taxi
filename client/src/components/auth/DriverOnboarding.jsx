import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Car, User, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

const steps = [
  { id: 1, title: 'Basic Info', icon: <User size={18} /> },
  { id: 2, title: 'Documents', icon: <Upload size={18} /> },
  { id: 3, title: 'Vehicle', icon: <Car size={18} /> },
];

const DriverOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    license: null,
    carModel: '',
    regNumber: ''
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 px-6 pt-12 pb-10">
      {/* Top Header & Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
            <button onClick={handleBack} className={`w-10 h-10 flex items-center justify-center bg-white rounded-full text-zinc-600 shadow-sm ${currentStep === 1 || currentStep === 4 ? 'invisible' : ''}`}>
                <ArrowLeft size={18} />
            </button>
            <div className="text-sm font-bold text-zinc-400 capitalize">Step {currentStep} of 3</div>
            <div className="w-10 h-10 invisible" />
        </div>

        {currentStep < 4 && (
            <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />
                <motion.div 
                    className="absolute top-1/2 left-0 h-0.5 bg-yellow-500 -translate-y-1/2 z-0"
                    animate={{ width: `${(currentStep - 1) * 50}%` }}
                />
                {steps.map((step) => (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            currentStep >= step.id ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-200' : 'bg-white text-zinc-400 border border-zinc-200'
                        }`}>
                            {currentStep > step.id ? <CheckCircle2 size={20} /> : step.icon}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Basic Information</h2>
                <p className="text-zinc-500">Let's start with your details</p>
              </div>
              <div className="space-y-4">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name</span>
                    <input 
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full mt-2 p-4 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Upload License</h2>
                <p className="text-zinc-500">We need to verify your driving eligibility</p>
              </div>
              <div 
                className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    formData.license ? 'border-yellow-500 bg-yellow-50' : 'border-zinc-200 bg-white hover:border-yellow-500 hover:bg-zinc-50'
                }`}
                onClick={() => setFormData({...formData, license: 'uploaded'})}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    formData.license ? 'bg-yellow-500 text-black' : 'bg-zinc-100 text-zinc-400'
                }`}>
                    {formData.license ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                </div>
                <p className="font-bold text-zinc-900">{formData.license ? 'License Uploaded' : 'Drag or click to upload'}</p>
                <p className="text-sm text-zinc-400 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3">
                 <div className="text-blue-500 pt-0.5 italic">!</div>
                 <p className="text-xs text-blue-700 font-medium leading-relaxed">Your data is stored securely and only used for verification purposes.</p>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Vehicle Details</h2>
                <p className="text-zinc-500">Tell us about the car you'll use</p>
              </div>
              <div className="space-y-4">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Car Model</span>
                    <input 
                        type="text"
                        placeholder="e.g. Toyota Camry 2024"
                        className="w-full mt-2 p-4 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium"
                        value={formData.carModel}
                        onChange={(e) => setFormData({...formData, carModel: e.target.value})}
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Registration Number</span>
                    <input 
                        type="text"
                        placeholder="e.g. ABC-1234"
                        className="w-full mt-2 p-4 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium"
                        value={formData.regNumber}
                        onChange={(e) => setFormData({...formData, regNumber: e.target.value})}
                    />
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-4 text-zinc-900">Application Sent!</h1>
              <p className="text-zinc-500 font-medium px-4 mb-10 leading-relaxed">
                Verification in progress. We'll review your documents and get back to you within 24–48 hours.
              </p>
              <button 
                onClick={handleNext}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg"
              >
                Got it
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentStep < 4 && (
        <div className="mt-8">
          <button
            onClick={handleNext}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 shadow-xl shadow-zinc-200 transition-all active:scale-95"
          >
            <span>{currentStep === 3 ? 'Finish Application' : 'Continue'}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverOnboarding;
