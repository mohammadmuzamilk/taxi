import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Phone, Lock, ArrowLeft } from 'lucide-react';

const LoginScreen = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length < 10 || phoneError) return;

    setIsLoading(true);
    try {
      // 1. Format number for the backend (+91 prefix)
      const formattedPhone = `+91${phone}`;

      // 1. Call Auth Service to send OTP
      const response = await fetch('http://localhost:5001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        if (data.debugOtp) {
          console.log('--- DEBUG OTP REVEALED ---', data.debugOtp);
          // Auto-fill OTP in dev mode for easy testing
          setOtp(data.debugOtp.split(''));
        }
      } else {
        setPhoneError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('OTP Send Error:', err);
      setPhoneError('Auth service is down. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    setOtpError(''); // Clear error on change
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus move forward
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Auto-focus move backward on Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return;

    setIsLoading(true);
    setOtpError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${phone}`,
          otp: otpString
        })
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess();
      } else {
        setOtpError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP Verify Error:', err);
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 px-6 pt-20 pb-10">
      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone-input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <div className="mb-10">
              <h1 className="text-3xl font-black tracking-tighter mb-2">Welcome to Chardho <span className="text-yellow-500">Go</span></h1>
              <p className="text-zinc-500 font-medium">Enter your phone number to get started</p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="flex flex-col space-y-6">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-yellow-600 transition-colors">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  placeholder="+91 Phone Number"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setPhone(value);
                      if (value.length > 0 && !/^[6-9]/.test(value)) {
                        setPhoneError('Must start with 6, 7, 8, or 9');
                      } else {
                        setPhoneError('');
                      }
                    }
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-zinc-50 border ${phoneError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-100 focus:ring-yellow-500/20 focus:border-yellow-500'} rounded-2xl focus:outline-none transition-all font-medium text-lg`}
                  maxLength={10}
                  inputMode="numeric"
                  autoFocus
                />
              </div>

              {phoneError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm font-semibold ml-2 -mt-4"
                >
                  {phoneError}
                </motion.p>
              )}

              <button
                disabled={phone.length < 10 || isLoading || !!phoneError}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 disabled:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-zinc-200"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-auto text-center">
              <p className="text-xs text-zinc-400 leading-relaxed px-10">
                By continuing, you agree to Chardho Go's <span className="text-zinc-900 underline font-medium">Terms of Service</span> and <span className="text-zinc-900 underline font-medium">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="otp-input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <button onClick={() => setStep('phone')} className="mb-8 w-10 h-10 flex items-center justify-center bg-zinc-50 rounded-full text-zinc-600">
              <ArrowLeft size={20} />
            </button>

            <div className="mb-10">
              <h1 className="text-3xl font-black tracking-tighter mb-2">Verify Phone</h1>
              <p className="text-zinc-500 font-medium">Enter the 6-digit code sent to <span className="text-zinc-900">{phone}</span></p>
            </div>

            <form onSubmit={handleOtpSubmit} className="flex flex-col space-y-8">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between space-x-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-full py-4 bg-zinc-50 border ${otpError ? 'border-red-500' : 'border-zinc-100'} rounded-xl text-center font-bold text-2xl focus:outline-none focus:ring-2 ${otpError ? 'focus:ring-red-500/20' : 'focus:ring-yellow-500/20'} focus:border-yellow-500 transition-all`}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm font-semibold text-center">{otpError}</p>
                )}
              </div>

              <div className="text-center">
                <button type="button" className="text-sm font-semibold text-yellow-600">Resend Code in 0:45</button>
              </div>

              <button
                disabled={otp.some(d => !d) || isLoading}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 disabled:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-zinc-200"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span>Verify & Proceed</span>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginScreen;
