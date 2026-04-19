require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rideRoutes = require('./src/routes/rideRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chardho_go_rides')
  .then(() => console.log('📦 Ride DB Connected'))
  .catch(err => console.error('DB Connection Error:', err));

// Routes
app.use('/api/rides', rideRoutes);

// --- SOCKET.IO REAL-TIME LOGIC ---
const drivers = new Map(); // Store online drivers: userId -> socketId + data

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  // Driver goes online
  socket.on('driver_online', (driverData) => {
    drivers.set(driverData.userId, {
      socketId: socket.id,
      ...driverData
    });
    console.log(`🚕 Driver ${driverData.userId} is online`);
  });

  // User requests a ride
  socket.on('ride_request', (requestData) => {
    console.log('🔔 New Ride Request:', requestData.rideId);
    
    // Simplistic matching: Broadcast to all online drivers
    // In a real app, filter by distance (lat/lng)
    drivers.forEach((driver) => {
      io.to(driver.socketId).emit('new_ride_available', requestData);
    });
  });

  // Driver accepts ride
  socket.on('accept_ride', (data) => {
    const { rideId, driverData } = data;
    console.log(`✅ Ride ${rideId} accepted by Driver ${driverData.name}`);
    
    // Notify the user who requested the ride
    socket.broadcast.emit(`ride_accepted_${rideId}`, data);
  });

  // Driver location update
  socket.on('update_location', (data) => {
    const { rideId, location } = data;
    // Notify user of driver's live movement
    socket.broadcast.emit(`driver_moved_${rideId}`, location);
  });

  // Ride status change (arrived, started, etc)
  socket.on('status_update', (data) => {
    const { rideId, status } = data;
    socket.broadcast.emit(`status_changed_${rideId}`, status);
  });

  socket.on('disconnect', () => {
    // Remove driver from online list if they disconnect
    for (let [userId, driver] of drivers.entries()) {
      if (driver.socketId === socket.id) {
        drivers.delete(userId);
        console.log(`❌ Driver ${userId} went offline`);
        break;
      }
    }
  });
});

const PORT = 5005;
server.listen(PORT, () => {
  console.log(`\n🚗 Ride Service & Sockets running on port ${PORT}`);
});
