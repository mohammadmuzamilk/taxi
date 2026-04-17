const smsService = require('../services/smsService');

/**
 * Controller to handle sending SMS.
 * POST /send-sms
 */
const postSendSMS = async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: "to" and "message".'
    });
  }

  try {
    const result = await smsService.sendSMS(to, message);
    
    return res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      sid: result.sid
    });
  } catch (error) {
    console.error(`SMS Controller Error: ${error.message}`);
    
    // Determine status code based on error type
    const statusCode = error.message.includes('Invalid') ? 400 : 500;
    
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  postSendSMS
};
