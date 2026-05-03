require('dotenv').config();
const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const morgan   = require('morgan');
const prisma   = require('../shared/prismaClient');
const { getDb } = require('../shared/mongoClient');

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://taxi-chi-six.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  path: '/api/drivers/socket.io'
});

// In-memory store: driverId → { socketId, ...driverData }
const onlineDrivers = new Map();

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('driver_online', (data) => {
    const id = data.userId || data._id || data.id;
    onlineDrivers.set(id, { socketId: socket.id, ...data });
    console.log(`🟢 Driver online: ${id}`);
  });

  socket.on('ride_request', (requestData) => {
    console.log('📣 Ride request broadcast:', requestData.rideId);
    onlineDrivers.forEach(driver => {
      io.to(driver.socketId).emit('new_ride_available', requestData);
    });
  });

  socket.on('accept_ride', ({ rideId, driverData }) => {
    socket.broadcast.emit(`ride_accepted_${rideId}`, { rideId, driverData });
  });

  socket.on('driver_location_update', async ({ driverId, lat, lng }) => {
    // 1. Broadcast to other clients (e.g., the rider app)
    socket.broadcast.emit(`driver_moved_${driverId}`, { lat, lng });

    // 2. Persist to MongoDB for geo-matching
    try {
      const db = await getDb();
      await db.collection('drivers_locations').updateOne(
        { driverId },
        { 
          $set: { 
            location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            updatedAt: new Date()
          } 
        },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed to persist driver location to MongoDB:', err.message);
    }
  });

  socket.on('status_update', ({ rideId, status }) => {
    socket.broadcast.emit(`status_changed_${rideId}`, status);
  });

  socket.on('disconnect', () => {
    for (const [id, d] of onlineDrivers.entries()) {
      if (d.socketId === socket.id) {
        onlineDrivers.delete(id);
        console.log(`🔴 Driver offline: ${id}`);
        break;
      }
    }
  });
});

// MongoDB Change Streams listener for cross-service ride updates
async function startWatching() {
  const db = await getDb();
  console.log('🏎️ Driver Service watching for ride updates in MongoDB...');
  
  const changeStream = db.collection('ride_updates').watch();
  
  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const data = change.fullDocument;
      console.log(`[Driver Service] Broadcasting update for ride ${data.rideId}: ${data.status}`);
      
      // Broadcast to all clients (they filter by rideId on frontend)
      io.emit(`ride_status_${data.rideId}`, data);
      
      // Also support the old event format for backward compatibility
      if (data.status === 'accepted') {
        io.emit(`ride_accepted_${data.rideId}`, { rideId: data.rideId, driverData: data.driver });
      }
    }
  });

  changeStream.on('error', (err) => {
    console.warn('⚠️ MongoDB Watch Error in Driver Service. Falling back to polling.');
    setInterval(async () => {
      const recent = await db.collection('ride_updates').find({
        createdAt: { $gt: new Date(Date.now() - 5000) }
      }).toArray();
      recent.forEach(data => {
        io.emit(`ride_status_${data.rideId}`, data);
      });
    }, 5000);
  });
}

startWatching().catch(err => {
  console.error('❌ Driver Service: Failed to start MongoDB watcher:', err.message);
  console.warn('⚠️ Service will continue without real-time MongoDB sync.');
});

// ── HTTP middlewares ──────────────────────────────────────────────────────────
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/drivers', require('./src/routes'));

// Health — verifies DB connectivity
app.get('/health', async (_, res) => {
  try {
    const db = await getDb();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'Driver Service OK', 
      onlineDrivers: onlineDrivers.size, 
      db: 'PostgreSQL connected',
      mongodb: db ? 'connected' : 'error'
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'Driver Service Error', 
      onlineDrivers: onlineDrivers.size, 
      db: 'unavailable',
      mongodb: err.message
    });
  }
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Driver Service Error:', err.stack);
  res.status(err.status || 500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`\n👨‍✈️ Driver Service + Socket.IO running on port ${PORT} (PostgreSQL/Prisma)`));
