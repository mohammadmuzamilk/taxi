const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Basic Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Taxi App Backend (Microservices) is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// MongoDB Connection (Optional for initial setup)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.log('⚠️ MONGO_URI not found in environment variables. Database connection skipped.');
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Root URL: http://localhost:${PORT}`);
});
