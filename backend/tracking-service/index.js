require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSockets = require('./src/socket');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  path: '/api/tracking/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup socket logic
setupSockets(io);

const { getDb } = require('../shared/mongoClient');

async function startWatching() {
  const db = await getDb();
  console.log('👀 Tracking Service watching for ride requests in MongoDB...');
  
  const changeStream = db.collection('driver_notifications').watch();
  
  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const data = change.fullDocument;
      if (data.event === 'ride_request') {
        console.log(`[Tracking] Broadcasting ride ${data.rideId} to drivers:`, data.driverIds);
        data.driverIds.forEach(driverId => {
          io.to(driverId).emit('new_ride_available', data);
        });
      }
    }
  });

  changeStream.on('error', (err) => {
    console.warn('⚠️ MongoDB Watch Error (likely no Replica Set). Falling back to polling.');
    // Simple polling fallback for standalone Mongo
    setInterval(async () => {
      const recent = await db.collection('driver_notifications').find({
        createdAt: { $gt: new Date(Date.now() - 5000) }
      }).toArray();
      recent.forEach(data => {
        if (data.event === 'ride_request') {
          io.to(data.driverId).emit('new_ride_available', data);
        }
      });
    }, 5000);
  });
}

startWatching().catch(err => {
  console.error('❌ Tracking Service: Failed to start MongoDB watcher:', err.message);
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const db = await getDb();
    res.json({ status: 'ok', service: 'tracking-service', mongodb: db ? 'connected' : 'error' });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'tracking-service', mongodb: err.message });
  }
});

const PORT = process.env.PORT || 5006;
server.listen(PORT, () => {
  console.log(`Tracking Service running on port ${PORT}`);
});
