require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

// Connect to Database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Mount Routes
app.use('/api/admins', require('./src/routes/adminRoutes'));

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'Admin Service is Healthy' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`\n🛡️  Admin Service running on port ${PORT}`);
});
