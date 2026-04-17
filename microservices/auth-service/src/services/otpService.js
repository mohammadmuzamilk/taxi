const Otp = require('../models/Otp');

/**
 * Generates a random 6-digit OTP.
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Saves an OTP for a specific phone number with an expiry (handled by TTL in DB).
 * @param {string} phone 
 * @param {string} otp 
 */
const saveOTP = async (phone, otp) => {
  // Clear any existing OTP for this number first
  await Otp.deleteMany({ phone });
  
  // Save new OTP
  await Otp.create({ phone, otp });
  console.log(`[DB STORED] OTP for ${phone}: ${otp}`);
};

/**
 * Verifies if the OTP is correct and not expired (DB deletes expired automatically).
 * @param {string} phone 
 * @param {string} enteredOtp 
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (phone, enteredOtp) => {
  const record = await Otp.findOne({ phone, otp: enteredOtp });
  
  if (record) {
    // Correct OTP, delete it immediately after successful verification
    await Otp.deleteMany({ phone });
    return true;
  }
  
  return false;
};

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP
};
