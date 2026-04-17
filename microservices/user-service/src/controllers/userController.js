const UserProfile = require('../models/UserProfile');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await UserProfile.findOne({ authId: req.user.id });
    
    // If profile doesn't exist yet, we just return empty or 404
    // Alternatively, it can be created lazily if we have name/email from req.user (we don't here)
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    let profile = await UserProfile.findOne({ authId: req.user.id });

    // Lazy create if it doesn't exist
    if (!profile) {
      profile = await UserProfile.create({
        authId: req.user.id,
        ...req.body
      });
      return res.status(201).json({ success: true, data: profile });
    }

    profile = await UserProfile.findOneAndUpdate(
      { authId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
