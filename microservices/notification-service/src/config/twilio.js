require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if we should use Mock Mode
const useMockMode = 
  process.env.TWILIO_MOCK_MODE === 'true' || 
  !accountSid || 
  !accountSid.startsWith('AC') || 
  !authToken;

if (useMockMode) {
  console.warn('\n⚠️  Twilio credentials missing or invalid. Running in MOCK MODE (SMS will be logged to console).');
}

const client = useMockMode ? null : twilio(accountSid, authToken);

module.exports = {
  client,
  twilioPhoneNumber,
  useMockMode
};
