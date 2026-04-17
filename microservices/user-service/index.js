const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/users', require('./src/routes/userRoutes'));

// Basic health check
app.get('/health', (req, res) => res.status(200).json({ status: 'User Service is Healthy' }));

const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 User Service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`\n❌ Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
