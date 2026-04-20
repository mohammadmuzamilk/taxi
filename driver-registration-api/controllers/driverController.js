const Driver = require('../models/Driver');

// @desc    Register a new driver
// @route   POST /api/driver/register
// @access  Public
exports.registerDriver = async (req, res) => {
  try {
    const driverData = req.body;

    // Create driver in database
    const driver = await Driver.create(driverData);

    res.status(201).json({
      success: true,
      message: 'Driver registered successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error registering driver:', error);
    
    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or Email already exists'
      });
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
