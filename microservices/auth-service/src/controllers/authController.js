const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const otpService = require('../services/otpService');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Please provide a phone number' });
    }

    // 1. Generate OTP
    const otp = otpService.generateOTP();

    // 2. Save OTP to DB
    await otpService.saveOTP(phone, otp);

    // 3. Send SMS via Notification Service
    try {
      await axios.post('http://localhost:5000/api/send-sms', {
        to: phone,
        message: `Your Chardho Go verification code is: ${otp}`
      });
      
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (smsErr) {
      console.error('Notification Service Error:', smsErr.message);
      // Even if SMS fails in dev, we return success so user can check logs for the OTP
      res.status(200).json({ 
        success: true, 
        message: 'OTP generated (SMS service simulation)',
        debugOtp: otp // Included for easier testing if Twilio fails
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Verify OTP and Login/Signup
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide phone and OTP' });
    }

    // 1. Verify OTP
    const isValid = await otpService.verifyOTP(phone, otp);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // 2. Find or Create User
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user if doesn't exist (Auto-signup)
      user = await User.create({
        phone,
        role: 'user' // Default role
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  res.status(statusCode).json({
    success: true,
    token
  });
};
