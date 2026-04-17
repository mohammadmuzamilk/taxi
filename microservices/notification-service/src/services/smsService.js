const { client, twilioPhoneNumber, useMockMode } = require('../config/twilio');
const validator = require('validator');
const retry = require('async-retry');

/**
 * Validates a phone number for E.164 format.
 * @param {string} phoneNumber 
 * @returns {boolean}
 */
const isValidPhoneNumber = (phoneNumber) => {
  // Must start with + and have 10-15 digits (standard E.164)
  return validator.isMobilePhone(phoneNumber, 'any', { strictMode: true });
};

/**
 * Reusable service function to send SMS using Twilio.
 * @param {string} to - Recipient phone number (e.g., +919876543210)
 * @param {string} message - Message content
 * @returns {Promise<object>} - Message SID on success
 */
const sendSMS = async (to, message) => {
  // 1. Validate phone number
  if (!to || !isValidPhoneNumber(to)) {
    throw new Error('Invalid phone number format. Must include country code (e.g., +91).');
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Message content cannot be empty.');
  }

  // 2. Implement retry mechanism
  return await retry(
    async (bail) => {
      // Handle Mock Mode
      if (useMockMode) {
        console.log('\n---------------- MOCK SMS SENT ----------------');
        console.log(`To:      ${to}`);
        console.log(`From:    ${twilioPhoneNumber || '+91-MOCK'}`);
        console.log(`Message: ${message}`);
        console.log('-----------------------------------------------\n');
        return { sid: `MOCK_SID_${Math.random().toString(36).substr(2, 9)}`, status: 'delivered' };
      }

      try {
        console.log(`Attempting to send SMS to ${to}...`);
        
        const response = await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: to
        });

        console.log(`SMS sent successfully! SID: ${response.sid}`);
        return { sid: response.sid, status: response.status };
      } catch (error) {
        // Bail on specific non-retryable errors
        if (error.code === 21211) { // Invalid 'To' Phone Number
          bail(new Error(`Twilio Error: The number ${to} is not a valid phone number.`));
          return;
        }
        if (error.code === 21614) { // 'To' number is not a mobile number
          bail(new Error('Twilio Error: The recipient number is not a mobile number.'));
          return;
        }

        // Network issues or API failures will trigger a retry
        console.error(`Twilio Error [${error.code}]: ${error.message}`);
        throw error;
      }
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
      onRetry: (error, attempt) => {
        console.warn(`Retry attempt ${attempt} due to: ${error.message}`);
      }
    }
  );
};

module.exports = {
  sendSMS,
  isValidPhoneNumber
};
