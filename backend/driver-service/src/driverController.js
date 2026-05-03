const prisma = require('../../shared/prismaClient');
const { getDb } = require('../../shared/mongoClient');
const axios = require('axios');

const syncToMongo = async (userId, driverId, data) => {
  try {
    const db = await getDb();
    await db.collection('drivers_registration').updateOne(
      { userId },
      { $set: { ...data, driverId, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error('MongoDB Driver Sync Error:', err.message);
  }
};

const RIDE_SERVICE_URL = process.env.RIDE_SERVICE_URL || 'http://localhost:5005';

// Vehicle Type Mapping
const VEHICLE_TYPE_MAP = {
  car: 'CAR',
  auto: 'AUTO',
  bike: 'BIKE'
};

const mapVehicleType = (type) => {
  if (!type) return null;
  return VEHICLE_TYPE_MAP[type.toLowerCase()];
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /profile   → requires role: driver
// ─────────────────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    // First try by userId (the auth user UUID stored in JWT)
    let driver = await prisma.driver.findFirst({
      where: { userId: req.user.id },
      include: { bankDetail: true }
    });

    // Fallback: link by phone if driver was registered before OTP login
    if (!driver && req.user.phone) {
      const phone = req.user.phone.startsWith('+') ? req.user.phone : `+91${req.user.phone}`;
      driver = await prisma.driver.findFirst({
        where: { phone },
        include: { bankDetail: true }
      });
      if (driver) {
        // Backfill the userId link so future lookups are fast
        driver = await prisma.driver.update({
          where: { id: driver.id },
          data:  { userId: req.user.id },
          include: { bankDetail: true }
        });
      }
    }

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver profile not found. Please complete your registration first.'
      });
    }

    res.json({ success: true, data: driver });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /check/:phone → public check if driver exists
// ─────────────────────────────────────────────────────────────────────────────
exports.checkDriver = async (req, res) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const normalised = phone.startsWith('+') ? phone : `+91${phone}`;

    const driver = await prisma.driver.findFirst({
      where: { phone: normalised }
    });

    res.json({ 
      success: true, 
      exists: !!driver,
      message: !!driver ? 'Driver found' : 'Driver not registered'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const driverUpdates = {
      name:         req.body.name,
      email:        req.body.email,
      vehicleModel: req.body.vehicle?.model  || req.body.vehicleModel,
      vehiclePlate: req.body.vehicle?.plateNumber || req.body.vehiclePlate,
      vehicleColor: req.body.vehicle?.color  || req.body.vehicleColor,
      vehicleYear:  req.body.vehicle?.year   || req.body.vehicleYear,
      vehicleType:  mapVehicleType(req.body.vehicle?.type || req.body.vehicleType),
      city:          req.body.locationDefaults?.city          || req.body.city,
      preferredArea: req.body.locationDefaults?.preferredArea || req.body.preferredArea,
      availability:  req.body.locationDefaults?.availability  || req.body.availability,
      selfDeclaration:  req.body.backgroundInfo?.selfDeclaration  ?? req.body.selfDeclaration,
      emergencyContact: req.body.backgroundInfo?.emergencyContact || req.body.emergencyContact,
    };

    const bankAccount = req.body.paymentDetails?.bankAccountNumber || req.body.bankAccount;
    const ifscCode = req.body.paymentDetails?.ifscCode || req.body.ifscCode;
    const accountHolder = req.body.paymentDetails?.accountHolderName || req.body.accountHolder;
    const upiId = req.body.paymentDetails?.upiId || req.body.upiId;

    const updates = Object.fromEntries(
      Object.entries(driverUpdates).filter(([, v]) => v !== undefined && v !== null)
    );

    const dataPayload = { ...updates };

    if (bankAccount !== undefined || ifscCode !== undefined || accountHolder !== undefined || upiId !== undefined) {
      dataPayload.bankDetail = {
        upsert: {
          create: {
            accountNumber: bankAccount || null,
            ifscCode: ifscCode || null,
            accountHolder: accountHolder || null,
            upiId: upiId || null
          },
          update: {
            accountNumber: bankAccount !== undefined ? bankAccount : undefined,
            ifscCode: ifscCode !== undefined ? ifscCode : undefined,
            accountHolder: accountHolder !== undefined ? accountHolder : undefined,
            upiId: upiId !== undefined ? upiId : undefined
          }
        }
      };
      
      // Clean undefined keys
      Object.keys(dataPayload.bankDetail.upsert.update).forEach(k => {
        if (dataPayload.bankDetail.upsert.update[k] === undefined) delete dataPayload.bankDetail.upsert.update[k];
      });
    }

    const driver = await prisma.driver.update({
      where: { userId: req.user.id },
      data:  dataPayload,
      include: { bankDetail: true }
    });

    // Sync to MongoDB
    await syncToMongo(req.user.id, driver.id, { ...driver });

    res.json({ success: true, data: driver });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Driver profile not found.' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /status   → toggle online/offline/busy (driver only)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be online | offline | busy' });
    }

    const driver = await prisma.driver.update({
      where: { userId: req.user.id },
      data:  { status }
    });

    // Sync status to MongoDB
    await syncToMongo(req.user.id, driver.id, { status: driver.status });

    res.json({ success: true, data: driver });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Driver profile not found.' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /register   → new driver registration (public, during onboarding)
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      fullName, name, email,
      license, governmentId, vehicle, documents, paymentDetails,
      locationDefaults, backgroundInfo,
      // flat fields from FormData
      licenseNumber, licenseExpiry, licenseType,
      idType, idNumber,
      vehicleType, vehicleModel, vehiclePlate, vehicleYear,
      bankAccount, ifscCode, upiId,
      city, preferredArea, availability,
      selfDeclaration, emergencyContact
    } = req.body;

    let phone = req.body.phone;
    if (phone) {
      phone = phone.replace(/[^\d+]/g, '');
      if (!phone.startsWith('+')) {
        if (phone.startsWith('91') && phone.length === 12) phone = `+${phone}`;
        else phone = `+91${phone}`;
      }
    }

    // Handle files if uploaded via multer
    const files = req.files || [];
    const getFileUrl = (fieldname) => {
      const file = files.find(f => f.fieldname === fieldname);
      // Replace with your cloud storage URL generator
      return file ? `/uploads/${file.filename}` : null;
    };

    // Ensure a User row exists for this phone (needed for FK)
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, name: fullName || name, role: 'driver' }
      });
    } else if (user.role !== 'driver') {
      // Upgrade existing user to driver role
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'driver' }
      });
    }

    const driver = await prisma.driver.create({
      data: {
        // ... (existing data mapping)
        userId:            user.id,
        name:              fullName || name,
        phone,
        email:             email || null,
        licenseNumber:     license?.number     || licenseNumber || null,
        licenseExpiry:     (license?.expiryDate && !isNaN(new Date(license.expiryDate).getTime())) ? new Date(license.expiryDate) : 
                           (licenseExpiry && !isNaN(new Date(licenseExpiry).getTime()) ? new Date(licenseExpiry) : null),
        licenseType:       license?.type       || licenseType || null,
        licenseFrontImage: license?.frontImage || getFileUrl('licenseFront') || null,
        licenseBackImage:  license?.backImage  || getFileUrl('licenseBack') || null,
        govIdType:         governmentId?.type   || idType || null,
        govIdNumber:       governmentId?.number || idNumber || null,
        govIdFrontImage:   governmentId?.frontImage || getFileUrl('idFront') || null,
        govIdBackImage:    governmentId?.backImage  || getFileUrl('idBack') || null,
        vehicleType:       mapVehicleType(vehicle?.type || vehicleType),
        vehicleModel:      vehicle?.model  || vehicleModel || null,
        vehiclePlate:      vehicle?.plateNumber || vehiclePlate || null,
        vehicleColor:      vehicle?.color  || null,
        vehicleYear:       vehicle?.year ? parseInt(vehicle?.year) : (vehicleYear && !isNaN(parseInt(vehicleYear)) ? parseInt(vehicleYear) : null),
        vehiclePhoto:      vehicle?.photo  || getFileUrl('vehiclePhoto') || null,
        docAadhaar:        documents?.aadhaarCard || getFileUrl('docAadhaar') || null,
        docPan:            documents?.panCard || getFileUrl('docPan') || null,
        docRC:             documents?.registrationCertificate || getFileUrl('docRC') || null,
        bankDetail: {
          create: {
            accountNumber: bankAccount || paymentDetails?.bankAccountNumber || null,
            ifscCode:      ifscCode    || paymentDetails?.ifscCode          || null,
            accountHolder: fullName    || name                              || null,
            upiId:         upiId       || paymentDetails?.upiId             || null,
          }
        },
        city:              locationDefaults?.city         || city || null,
        preferredArea:     locationDefaults?.preferredArea || preferredArea || null,
        availability:      locationDefaults?.availability || availability || null,
        selfDeclaration:   backgroundInfo?.selfDeclaration !== undefined ? backgroundInfo.selfDeclaration : (selfDeclaration === 'true'),
        emergencyContact:  backgroundInfo?.emergencyContact || emergencyContact || null,
        verificationStatus: 'UNDER_REVIEW',
      },
      include: { bankDetail: true }
    });

    // Sync to MongoDB
    await syncToMongo(user.id, driver.id, { ...driver });

    res.status(201).json({ success: true, message: 'Registration submitted for review.', data: driver });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Phone number or license already registered.' });
    }
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /all   → admin: get all drivers
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { phone: true, email: true } } }
    });
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /verify/:id   → admin: approve / reject driver
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyDriver = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ['APPROVED', 'REJECTED', 'UNDER_REVIEW'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const updateData = { verificationStatus: status };
    if (status === 'REJECTED' && rejectionReason) updateData.rejectionReason = rejectionReason;

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data:  updateData
    });

    // Sync verification status to MongoDB
    await syncToMongo(driver.userId, driver.id, { verificationStatus: driver.verificationStatus, rejectionReason: driver.rejectionReason });

    res.json({ success: true, data: driver });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Driver not found.' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/driver-by-phone/:phone  → internal call from client-service
// ─────────────────────────────────────────────────────────────────────────────
exports.getByPhone = async (req, res) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const normalised = phone.startsWith('+') ? phone : `+91${phone}`;

    const driver = await prisma.driver.findFirst({
      where: { OR: [{ phone: normalised }, { phone: phone }] }
    });

    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found.' });
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /earnings   → driver: real earnings from rides (via HTTP to client-service)
// ─────────────────────────────────────────────────────────────────────────────
exports.getEarnings = async (req, res) => {
  try {
    const driver = await prisma.driver.findFirst({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ success: false, error: 'Driver profile not found.' });

    const CLIENT_URL = process.env.CLIENT_SERVICE_URL || 'http://localhost:5001';
    const ridesRes   = await fetch(`${CLIENT_URL}/rides/driver/${driver.id}/completed`).catch(() => null);

    if (!ridesRes || !ridesRes.ok) {
      return res.json({ success: true, data: { totalEarnings: 0, totalTrips: 0, totalHours: 0, dailyEarnings: [0,0,0,0,0,0,0] } });
    }

    const { data: rides = [] } = await ridesRes.json();

    const daily = [0,0,0,0,0,0,0];
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    rides.forEach(r => {
      if (new Date(r.createdAt).getTime() >= oneWeekAgo) {
        const day = new Date(r.createdAt).getDay();
        const idx = day === 0 ? 6 : day - 1;
        daily[idx] += Number(r.fare || 0);
      }
    });

    const totalEarnings = rides.reduce((s, r) => s + Number(r.fare || 0), 0);

    res.json({
      success: true,
      data: {
        totalEarnings,
        totalTrips:    rides.length,
        totalHours:    Math.round(rides.length * 0.75),
        dailyEarnings: daily
      }
    });
  } catch (err) {
    console.error('getEarnings error:', err);
    res.json({ success: true, data: { totalEarnings: 0, totalTrips: 0, totalHours: 0, dailyEarnings: [0,0,0,0,0,0,0] } });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /trips   → driver: list of own rides
// ─────────────────────────────────────────────────────────────────────────────
exports.getTrips = async (req, res) => {
  try {
    const driver = await prisma.driver.findFirst({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ success: false, error: 'Driver profile not found.' });

    const CLIENT_URL = process.env.CLIENT_SERVICE_URL || 'http://localhost:5001';
    const ridesRes   = await fetch(`${CLIENT_URL}/rides/driver/${driver.id}/all`).catch(() => null);

    if (!ridesRes || !ridesRes.ok) {
      return res.json({ success: true, data: [] });
    }

    const result = await ridesRes.json();
    res.json({ success: true, data: result.data || [] });
  } catch (err) {
    console.error('getTrips error:', err);
    res.json({ success: true, data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROXY TO NEW RIDE-SERVICE (Microservices Architecture Extension)
// ─────────────────────────────────────────────────────────────────────────────
exports.proxyAcceptRide = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.post(`${RIDE_SERVICE_URL}/api/rides/${req.body.rideId}/accept`, req.body, {
      headers: { Authorization: token }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message;
    res.status(status).json({ success: false, error });
  }
};

exports.proxyRejectRide = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.post(`${RIDE_SERVICE_URL}/api/rides/${req.body.rideId}/reject`, req.body, {
      headers: { Authorization: token }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message;
    res.status(status).json({ success: false, error });
  }
};

exports.proxyStartRide = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.post(`${RIDE_SERVICE_URL}/api/rides/${req.body.rideId}/start-otp`, { otp: req.body.otp }, {
      headers: { Authorization: token }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message;
    res.status(status).json({ success: false, error });
  }
};
