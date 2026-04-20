const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const twilio = require('twilio');
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

    // 3. Send SMS via Twilio directly
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      
      const useMockMode = process.env.TWILIO_MOCK_MODE === 'true' || !accountSid || !authToken;

      if (useMockMode) {
        console.log('\n--- MOCK SMS ---');
        console.log(`To:      ${phone}`);
        console.log(`Message: Your Chardho Go verification code is: ${otp}`);
        console.log('----------------\n');
        return res.status(200).json({ 
          success: true, 
          message: 'OTP generated (MOCK MODE)',
          debugOtp: otp 
        });
      }

      console.log(`Attempting to send SMS to ${phone} via Twilio...`);
      const client = twilio(accountSid, authToken);
      const response = await client.messages.create({
        body: `Your Chardho Go verification code is: ${otp}`,
        from: twilioPhoneNumber,
        to: phone
      });
      
      console.log(`SMS sent successfully! SID: ${response.sid}`);
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (smsErr) {
      console.error('Twilio Error:', smsErr.message);
      
      // If Twilio fails (e.g. unverified number on trial account), return debugOtp so user can still test
      res.status(200).json({ 
        success: true, 
        message: 'OTP generated (but SMS failed - check logs)',
        error: smsErr.message,
        debugOtp: otp 
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Verify OTP and Login/Signup
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp, role } = req.body;

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
        role: role || 'user' // Use provided role or default to 'user'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/update-me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    const { name, email, carModel, regNumber } = req.body;
    
    // In a real app, you'd get user ID from the JWT (req.user.id)
    // For this demo, let's assume phone is passed or use a specific identifier
    const { phone } = req.body; 

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number required to update profile' });
    }

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    // We could store vehicle info in a separate collection or sub-doc, 
    // but for simplicity let's stick to the User model if it's there
    if (carModel) fieldsToUpdate.carModel = carModel;
    if (regNumber) fieldsToUpdate.regNumber = regNumber;

    const user = await User.findOneAndUpdate({ phone }, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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
  // Create token with fallbacks to prevent crashes if env vars are forgotten in Railway
  const secret = process.env.JWT_SECRET || 'chardho_go_super_secret_fallback_key';
  const expire = process.env.JWT_EXPIRE || '30d';
  
  const token = jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: expire
  });

  res.status(statusCode).json({
    success: true,
    token
  });
};
