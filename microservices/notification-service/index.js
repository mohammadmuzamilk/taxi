require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const smsRoutes = require('./src/routes/smsRoutes');

const app = express();
app.use(cors()); // Enable CORS for all routes
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logger for requests

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', smsRoutes);
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong on the server!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SMS Service is running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📩 SMS Endpoint: http://localhost:${PORT}/api/send-sms`);
});
