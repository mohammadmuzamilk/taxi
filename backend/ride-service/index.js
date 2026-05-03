require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rideRoutes = require('./src/routes/rideRoutes');

const { getDb } = require('../shared/mongoClient');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rides/v2', rideRoutes);

app.get('/health', async (req, res) => {
  try {
    const db = await getDb();
    const mongoStatus = db ? 'connected' : 'error';
    res.json({ status: 'ok', service: 'ride-service', mongodb: mongoStatus });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'ride-service', mongodb: err.message });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, async () => {
  console.log(`Ride Service running on port ${PORT}`);
  // Connect to MongoDB on startup — non-fatal
  getDb().catch(err => {
    console.error('❌ Ride Service: Initial MongoDB connection failed:', err.message);
  });
});
