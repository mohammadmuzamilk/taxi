const prisma = require('../../shared/prismaClient');
const axios = require('axios');

const RIDE_SERVICE_URL = process.env.RIDE_SERVICE_URL || 'http://localhost:5005';

// ─────────────────────────────────────────────────────────────────────────────
// POST /rides/request
// ─────────────────────────────────────────────────────────────────────────────
exports.requestRide = async (req, res) => {
  try {
    const { user, pickup, drop, fare, distance, duration } = req.body;

    const ride = await prisma.ride.create({
      data: {
        clientId:      req.user.id,
        clientName:    user?.name  || null,
        clientPhone:   user?.phone || null,
        pickupAddress: pickup?.address || pickup || '',
        pickupLat:     pickup?.lat     || null,
        pickupLng:     pickup?.lng     || null,
        dropAddress:   drop?.address   || drop   || '',
        dropLat:       drop?.lat       || null,
        dropLng:       drop?.lng       || null,
        fare:          fare     || null,
        distance:      distance || null,
        duration:      duration || null,
        status:        'searching',
      }
    });

    res.status(201).json({ success: true, data: ride });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /rides/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getRide = async (req, res) => {
  try {
    const ride = await prisma.ride.findUnique({
      where:   { id: req.params.id },
      include: { payment: true }
    });
    if (!ride) return res.status(404).json({ success: false, error: 'Ride not found.' });
    res.json({ success: true, data: ride });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /rides/:id/status
// Body: { status, driver? }
// Uses a transaction when assigning a driver to prevent double-booking
// ─────────────────────────────────────────────────────────────────────────────
exports.updateRideStatus = async (req, res) => {
  try {
    const { status, driver } = req.body;
    const rideId = req.params.id;

    // If a driver is being assigned (status = accepted), use a transaction
    // to ensure only one driver can claim the ride atomically
    if (status === 'accepted' && driver?.id) {
      const updatedRide = await prisma.$transaction(async (tx) => {
        // Lock the ride row and confirm it is still in 'searching' state
        const current = await tx.ride.findUnique({ where: { id: rideId } });
        if (!current) throw Object.assign(new Error('Ride not found.'), { status: 404 });
        if (current.status !== 'searching') {
          throw Object.assign(
            new Error(`Ride already ${current.status}. Cannot accept.`),
            { status: 409 }
          );
        }

        return tx.ride.update({
          where: { id: rideId },
          data: {
            status:        'accepted',
            driverId:      driver.id   || null,
            driverName:    driver.name || null,
            driverPhone:   driver.phone   || null,
            driverVehicle: driver.vehicle || null,
            driverLat:     driver.location?.lat || null,
            driverLng:     driver.location?.lng || null,
          }
        });
      });

      return res.json({ success: true, data: updatedRide });
    }

    // Simple status update (no driver assignment)
    const ride = await prisma.ride.update({
      where: { id: rideId },
      data:  { status }
    });
    res.json({ success: true, data: ride });
  } catch (err) {
    const code = err.status || (err.code === 'P2025' ? 404 : 400);
    res.status(code).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /rides/driver/:driverId/completed  → used by driver-service earnings
// ─────────────────────────────────────────────────────────────────────────────
exports.getDriverCompletedRides = async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      where:   { driverId: req.params.driverId, status: 'completed' },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: rides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /rides/driver/:driverId/all  → used by driver-service trips
// ─────────────────────────────────────────────────────────────────────────────
exports.getDriverAllRides = async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      where:   { driverId: req.params.driverId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: rides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROXY TO NEW RIDE-SERVICE (Microservices Architecture Extension)
// ─────────────────────────────────────────────────────────────────────────────
exports.proxyBookRide = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.post(`${RIDE_SERVICE_URL}/api/rides/book`, req.body, {
      headers: { Authorization: token }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message;
    res.status(status).json({ success: false, error });
  }
};

exports.proxyScheduleRide = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.post(`${RIDE_SERVICE_URL}/api/rides/schedule`, req.body, {
      headers: { Authorization: token }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message;
    res.status(status).json({ success: false, error });
  }
};
