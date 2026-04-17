// @desc    Send notification
// @route   POST /api/notifications/send
// @access  Internal/Private
exports.sendNotification = async (req, res, next) => {
  try {
    const { userId, message, type } = req.body;

    console.log(`\n🔔 Notification to User ${userId}: [${type}] ${message}`);

    // Mock sending logic
    res.status(200).json({
      success: true,
      message: 'Notification sent effectively'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
