const express = require('express');
const router = express.Router();
const auth = require('../../../shared/authMiddleware');

router.post('/sos', auth.protect, async (req, res) => {
  try {
    const { lat, lng, rideId } = req.body;
    const userId = req.user.id;
    const role = req.user.role; // Both driver and client can trigger SOS

    const message = `[🚨 EMERGENCY SOS 🚨] Triggered by ${role} ${userId}. Location: https://maps.google.com/?q=${lat},${lng}. Ride ID: ${rideId || 'None'}`;

    // Here we would fetch trusted contacts from DB for the user and send SMS.
    // For now, log the mock action:
    console.log(`\n\n===========================================`);
    console.log(message);
    console.log(`===========================================\n\n`);

    // In a real scenario, integrate Twilio / Gupshup API here to text contacts & police if necessary.

    res.status(200).json({ success: true, message: 'SOS Alert triggered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
