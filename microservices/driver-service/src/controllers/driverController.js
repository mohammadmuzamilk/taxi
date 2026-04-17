const Driver = require('../models/Driver');

// @desc    Get driver profile
// @route   GET /api/drivers/profile
// @access  Private (Driver/Admin)
exports.getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ authId: req.user.id });

    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver profile not found' });
    }

    res.status(200).json({ success: true, data: driver });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update driver status (online/offline)
// @route   POST /api/drivers/status
// @access  Private (Driver/Admin)
exports.updateDriverStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide valid status (online/offline)' });
    }

    let driver = await Driver.findOne({ authId: req.user.id });

    if (!driver) {
      // Lazy create for demonstration, usually created during onboarding
      driver = await Driver.create({
        authId: req.user.id,
        name: 'New Driver', // Placeholder
        phone: '0000000000', // Placeholder
        licenseNumber: 'TEMP-' + req.user.id,
        status
      });
    } else {
      driver = await Driver.findOneAndUpdate(
        { authId: req.user.id },
        { status },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({ success: true, data: driver });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all drivers
// @route   GET /api/drivers/all
// @access  Private (Admin)
exports.getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

