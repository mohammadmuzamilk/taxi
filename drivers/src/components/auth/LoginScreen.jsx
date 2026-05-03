import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export const LoginScreen = ({ 
  authStep, 
  phoneNumber, 
  setPhoneNumber, 
  handleSendOtp, 
  otp, 
  setOtp, 
  handleVerifyOtp, 
  setAuthStep, 
  loading, 
  error 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-white"
    >
      <div className="w-full max-w-sm space-y-12">
        <div className="text-center">
          <div className="inline-block p-4 bg-yellow-500 rounded-3xl mb-6 shadow-2xl shadow-yellow-500/20">
            <h1 className="text-4xl font-black text-black italic tracking-tighter">GO</h1>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Driver Partner</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Professional Portal</p>
        </div>

        {authStep === 'phone' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 focus-within:border-yellow-500/50 transition-colors">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Phone Number</label>
              <div className="flex items-center">
                <span className="text-zinc-400 font-bold mr-2">+91</span>
                <input 
                  type="tel" 
                  placeholder="00000 00000"
                  className="bg-transparent w-full font-bold text-lg outline-hidden"
                  value={phoneNumber.replace('+91', '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => handleSendOtp(phoneNumber)}
              disabled={loading || phoneNumber.length < 10}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        )}

        {authStep === 'otp' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Verify Code</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Sent to +91 {phoneNumber.replace('+91', '')}</p>
            </div>

            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (!val && e.target.value !== '') return;
                    const newOtp = [...otp];
                    newOtp[i] = val.substring(val.length - 1);
                    setOtp(newOtp);
                    if (val && i < 5) document.getElementById(`otp-${i+1}`).focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                      document.getElementById(`otp-${i-1}`).focus();
                    }
                  }}
                  className="w-full h-14 bg-zinc-900 border border-white/10 rounded-xl text-center text-2xl font-black focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all outline-hidden"
                />
              ))}
            </div>

            <button 
              onClick={() => handleVerifyOtp(otp)}
              disabled={loading || otp.some(d => !d)}
              className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-yellow-500/20 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button onClick={() => setAuthStep('phone')} className="w-full text-zinc-500 font-bold text-xs uppercase tracking-widest">Change Phone Number</button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-[10px] font-bold text-center uppercase tracking-widest leading-relaxed">
            {error.includes('portal') ? (
              <>
                {error.split('portal')[0]}
                <a 
                  href={`http://${window.location.hostname}:5173/driver-onboarding`} 
                  className="underline text-white hover:text-yellow-500 transition-colors"
                >
                  portal
                </a>
                {error.split('portal')[1]}
              </>
            ) : error}
          </div>
        )}
      </div>
    </motion.div>
  );
};
