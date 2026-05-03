import { useState, useEffect } from 'react';
import { socket, API_BASE } from '../utils/socket';

export const useDriverAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('driverToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authStep, setAuthStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  
  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    setToken(null);
    setUser(null);
    setAuthStep('phone');
    socket.disconnect();
  };

  const checkProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/drivers/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (res.status === 404) {
        setError('Driver profile not found. Please register as a driver first.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        if (!socket.connected) socket.connect();
      }
    } catch (_err) {
      console.error('Profile check failed', _err);
    }
  };

  // Auto-verify on mount
  useEffect(() => {
    if (token) {
      checkProfile(token); // eslint-disable-line
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSendOtp = async (phone) => {
    setLoading(true);
    setError(null);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      // 1. Check if driver is registered first
      const checkRes = await fetch(`${API_BASE}/api/drivers/check/${encodeURIComponent(formattedPhone)}`);
      const checkData = await checkRes.json();
      
      if (checkData.success && !checkData.exists) {
        setError('Not registered? Please complete your driver registration at the Chardho Go portal first.');
        setLoading(false);
        return;
      }

      setPhoneNumber(formattedPhone);
      setVerifiedPhone(formattedPhone); // Lock this number for verification

      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone })
      });
      const data = await res.json();
      if (data.success) {
        setAuthStep('otp');
        if (data.debugOtp) console.log('DEBUG OTP:', data.debugOtp);
      } else {
        setError(data.error || 'Invalid OTP. Please ask the passenger.');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_ERR) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    const finalOtp = Array.isArray(otpCode) ? otpCode.join('') : otpCode;
    setLoading(true);
    setError(null);
    try {
      console.log(`[Auth] Verifying OTP for ${verifiedPhone}...`);
      
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: verifiedPhone, otp: finalOtp, role: 'driver' })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('driverToken', data.token);
        setToken(data.token);
        checkProfile(data.token);
      } else {
        setError(data.error || data.message || 'Invalid OTP');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_ERR) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    loading,
    error,
    authStep,
    setAuthStep,
    handleSendOtp,
    handleVerifyOtp,
    handleLogout,
    otp,
    setOtp,
    phoneNumber,
    setPhoneNumber
  };
};
