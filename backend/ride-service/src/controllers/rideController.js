const prisma = require('../../../shared/prismaClient');
const driverMatching = require('../services/driverMatching');
const { getDb } = require('../../../shared/mongoClient');
const crypto = require('crypto');

// Utility to generate a random 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// Vehicle Type Mapping
const VEHICLE_TYPE_MAP = {
  car: 'CAR',
  prime: 'CAR',
  sedan: 'CAR',
  auto: 'AUTO',
  bike: 'BIKE'
};

const mapVehicleType = (type) => {
  if (!type) return null;
  return VEHICLE_TYPE_MAP[type.toLowerCase()];
};

exports.bookRide = async (req, res) => {
  try {
    const { pickupLat, pickupLng, pickupAddress, dropLat, dropLng, dropAddress, vehicleType: rawVehicleType, driverId } = req.body;
    const userId = req.user.id;

    // Validate and map vehicle type
    const mappedVehicleType = mapVehicleType(rawVehicleType);
    if (!mappedVehicleType) {
      return res.status(400).json({ success: false, error: 'Invalid vehicle type' });
    }

    // RBAC Safety: Ensure role is allowed to book (users and drivers)
    console.log(`[Booking] User ${req.user.id} attempting to book with role: ${req.user.role}`);
    if (req.user.role !== 'user' && req.user.role !== 'driver') {
      return res.status(403).json({ success: false, error: `Only riders and drivers can book rides. Your role: ${req.user.role}` });
    }

    // Check if user already has an active ride
    const activeRide = await prisma.ride.findFirst({
      where: {
        userId,
        status: { in: ['searching', 'accepted', 'arrived', 'ongoing'] }
      }
    });

    if (activeRide) {
      return res.status(400).json({ success: false, error: 'You already have an active ride' });
    }

    // Basic fare calculation based on straight-line distance (mock logic)
    const mockFare = 150.00;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const ride = await prisma.ride.create({
      data: {
        userId,
        userName: user.name || 'User',
        userPhone: user.phone,
        pickupLat,
        pickupLng,
        pickupAddress,
        dropLat,
        dropLng,
        dropAddress,
        vehicleType: mappedVehicleType,
        fare: mockFare,
        status: 'searching'
      }
    });

    // Start driver matching process async
    if (driverId) {
      // Notify only the selected driver
      driverMatching.notifyDriversViaTrackingService([driverId], ride);
    } else {
      driverMatching.findAndNotifyDrivers(ride, pickupLat, pickupLng, mappedVehicleType);
    }

    res.status(201).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scheduleRide = async (req, res) => {
  // Similar to bookRide, but stores scheduled time and doesn't trigger matching immediately
  res.status(501).json({ success: false, message: 'Scheduled rides not implemented yet' });
};

exports.acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
    
    // Concurrency control: only update if still 'searching'
    if (ride.status !== 'searching') {
      return res.status(400).json({ success: false, error: 'Ride no longer available' });
    }

    // Fetch the DRIVER record using the userId from token
    const driver = await prisma.driver.findUnique({ where: { userId } });
    if (!driver) return res.status(404).json({ success: false, error: 'Driver profile not found' });

    // Generate OTP for this ride
    const rideOtp = generateOtp();
    const db = await getDb();
    await db.collection('otps').updateOne(
      { rideId },
      { $set: { otp: rideOtp, createdAt: new Date() } },
      { upsert: true }
    );

    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: driver.id, // MUST use Driver.id, not User.id
        status: 'accepted',
        driverName: driver.name,
        driverPhone: driver.phone,
        driverVehicle: driver.vehiclePlate
      }
    });

    // Clean up pending drivers from MongoDB
    await db.collection('pending_matches').deleteOne({ rideId });

    // Call notification service via MongoDB "PubSub" (Change Streams)
    await db.collection('notifications').insertOne({
      type: 'sms',
      recipientId: ride.userId,
      message: `Your driver has accepted the ride. Your OTP is ${rideOtp}.`,
      createdAt: new Date()
    });

    // Notify Driver Service sockets via MongoDB
    await db.collection('ride_updates').insertOne({
      rideId,
      status: 'accepted',
      driver: {
        id: driverId,
        name: updatedRide.driverName,
        phone: updatedRide.driverPhone,
        vehiclePlate: updatedRide.driverVehicle
      },
      createdAt: new Date()
    });

    res.status(200).json({ success: true, data: updatedRide });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rejectRide = async (req, res) => {
  // Logic to handle driver rejection, pop them from pending list and notify next
  res.status(200).json({ success: true, message: 'Ride rejected' });
};

exports.verifyOtpAndStartRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { otp } = req.body;
    const driverId = req.user.id;

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.driverId !== driverId) {
      return res.status(403).json({ success: false, error: 'Not authorized for this ride' });
    }

    const db = await getDb();
    const otpDoc = await db.collection('otps').findOne({ rideId });
    if (!otpDoc || otpDoc.otp !== otp.toString()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'ongoing',
        startedAt: new Date()
      }
    });

    // Delete OTP
    await db.collection('otps').deleteOne({ rideId });

    // Generate Tracking Link for Live Location Sharing
    const trackingLink = `https://chardhogo.com/track/${crypto.randomBytes(8).toString('hex')}`;
    await db.collection('metadata').updateOne(
      { key: `tracking_link:${rideId}` },
      { $set: { value: trackingLink, createdAt: new Date() } },
      { upsert: true }
    );

    res.status(200).json({ success: true, data: updatedRide, trackingLink });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    
    // Validation rules for state machine (REQUESTED -> ACCEPTED -> ARRIVED -> ONGOING -> COMPLETED)
    const validStatuses = ['arrived', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status update' });
    }

    const dataToUpdate = { status };
    if (status === 'completed') dataToUpdate.completedAt = new Date();

    const ride = await prisma.ride.update({
      where: { id: rideId },
      data: dataToUpdate
    });

    // Notify Driver Service sockets about the status change
    const db = await getDb();
    await db.collection('ride_updates').insertOne({
      rideId,
      status: status,
      createdAt: new Date()
    });

    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRideDetails = async (req, res) => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.rideId },
      include: {
        user: { select: { name: true, phone: true } },
        driver: { select: { name: true, phone: true, vehiclePlate: true, rating: true } }
      }
    });
    if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
    
    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNearbyDrivers = async (req, res) => {
  try {
    const { lat, lng, vehicleType } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Location (lat, lng) is required' });
    }

    const mappedType = mapVehicleType(vehicleType);
    
    const drivers = await driverMatching.getNearbyDrivers(lat, lng, mappedType, 500);
    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getActiveRide = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let ride;
    if (role === 'driver') {
      const driver = await prisma.driver.findUnique({ where: { userId } });
      if (!driver) return res.json({ success: true, data: null });
      ride = await prisma.ride.findFirst({
        where: {
          driverId: driver.id,
          status: { in: ['accepted', 'arrived', 'ongoing'] }
        },
        include: {
          user: { select: { name: true, phone: true } }
        }
      });
    } else {
      ride = await prisma.ride.findFirst({
        where: {
          userId: userId,
          status: { in: ['searching', 'accepted', 'arrived', 'ongoing'] }
        },
        include: {
          driver: { select: { name: true, phone: true, vehiclePlate: true, rating: true } }
        }
      });
    }

    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
