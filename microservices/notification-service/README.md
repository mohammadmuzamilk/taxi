# Twilio SMS Backend Module Walkthrough

This module provides a robust, scalable backend service to send SMS messages using Twilio. It is designed for production use in a taxi application or similar platforms.

## Core Features
- **Twilio Integration**: Uses the official `twilio` SDK.
- **Security**: Credentials managed through environment variables (`.env`).
- **Validation**: Strict E.164 phone number validation (must include country code).
- **Resilience**: Integrated retry mechanism for transient network or API failures using `async-retry`.
- **Security & Stability**: Rate limiting (powered by `express-rate-limit`) to prevent abuse and API cost spikes.
- **Clean Architecture**: Separation of concerns into Config, Services, Controllers, and Routes.

## Implementation Details

### 1. Project Structure
The module is located in the `server/` directory:
- `index.js`: Main entry point setting up Express and middleware.
- `src/config/twilio.js`: Client initialization.
- `src/services/smsService.js`: Core logic for `sendSMS(to, message)`.
- `src/controllers/smsController.js`: Request/Response handling.
- `src/routes/smsRoutes.js`: Routing with rate limiters.

### 2. Service Logic (Resilience)
The `sendSMS` function uses `async-retry` to handle flaky connections. It will attempt to send the message up to 3 times before failing.
```javascript
const result = await retry(async (bail) => {
  // Logic to send SMS
}, { retries: 3 });
```

### 3. Safety First (Rate Limiting)
To protect your Twilio account from being drained by script-kiddies or bugs, a rate limiter is applied to the `/send-sms` endpoint:
- **Limit**: 5 requests per 15 minutes per IP (can be adjusted in `src/routes/smsRoutes.js`).

## How to Run

1. **Install Dependencies**:
   Already done in the setup, but if you're on a new machine:
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**:
   Update the `server/.env` file with your actual Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```

## Usage Example
**Endpoint**: `POST http://localhost:5000/api/send-sms`

**Request Body**:
```json
{
  "to": "+919876543210",
  "message": "Your ride has been booked successfully! Taxi ID: TAXI-123"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Error Response (e.g., Rate Limited)**:
```json
{
  "success": false,
  "error": "Too many SMS requests from this IP, please try again after 15 minutes"
}
```
