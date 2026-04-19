require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

// Connect to Database
connectDB();

const app = express();
app.use(cors()); // Enable CORS for all routes
const PORT = process.env.PORT || 5001; // Different port from notification service

// Middleware
app.use(express.json());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes
app.use('/', authRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service' });
});

// Default Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🔑 Auth Service is running on port ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/auth`);
});
