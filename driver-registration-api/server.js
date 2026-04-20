require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const driverRoutes = require('./routes/driverRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing JSON bodies

// Routes
app.use('/api/driver', driverRoutes);

// Root route for health check
app.get('/', (req, res) => {
  res.json({ message: 'Driver Registration API is running' });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
