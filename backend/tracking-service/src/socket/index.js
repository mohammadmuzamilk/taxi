const jwt = require('jsonwebtoken');
const { getDb } = require('../../../shared/mongoClient');
const JWT_SECRET = process.env.JWT_SECRET || 'chardho_go_super_secret_fallback_key';

module.exports = (io) => {
  // Authentication Middleware for Sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: Token missing'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role})`);

    // Join room based on user ID for direct messages
    socket.join(socket.user.id);

    // If user, join their own tracking room
    if (socket.user.role === 'user') {
      socket.on('join_ride_tracking', ({ rideId }) => {
        socket.join(`ride_${rideId}`);
        console.log(`User ${socket.user.id} joined ride tracking for ${rideId}`);
      });
    }

    // Driver location updates
    if (socket.user.role === 'driver') {
      socket.on('driver_location_update', async (data) => {
        const { lat, lng, rideId } = data;
        const driverId = socket.user.id;

        // Store latest location in MongoDB (geo queries for matching)
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
        
        // Also store as a normal key for quick retrieval (compatible with previous logic)
        await db.collection('driver_current_status').updateOne(
          { driverId },
          { $set: { lat, lng, updatedAt: new Date() } },
          { upsert: true }
        );

        // If driver is on an active ride, broadcast to that ride's room
        if (rideId) {
          io.to(`ride_${rideId}`).emit('driver_location_update', { driverId, lat, lng });
        }
      });
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};
