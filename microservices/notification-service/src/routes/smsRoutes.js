const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const smsController = require('../controllers/smsController');

/**
 * Rate limiting to prevent abuse.
 * Limits to 5 requests per 15 minutes per IP.
 */
const smsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many SMS requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /send-sms
router.post('/send-sms', smsRateLimiter, smsController.postSendSMS);

module.exports = router;
