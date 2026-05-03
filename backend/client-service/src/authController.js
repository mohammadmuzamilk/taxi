const twilio    = require('twilio');
const prisma    = require('../../shared/prismaClient');
const { getDb } = require('../../shared/mongoClient');
const { generateToken } = require('../../shared/authMiddleware');

// ── Helper: Sync Registration to MongoDB ─────────────────────────────────────
const syncToMongo = async (userId, data) => {
  try {
    const db = await getDb();
    await db.collection('users_registration').updateOne(
      { userId },
      { $set: { ...data, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error('MongoDB Sync Error:', err.message);
  }
};

// ── Helper: generate 6-digit OTP ──────────────────────────────────────────────
const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Helper: normalise phone to +91XXXXXXXXXX ─────────────────────────────────
const normalisePhone = (raw) => {
  if (!raw) return null;
  // Strip all non-digits, but keep + if it's at the start
  let clean = raw.replace(/[^\d+]/g, '');
  
  if (clean.startsWith('+')) return clean;
  if (clean.startsWith('91') && clean.length === 12) return `+${clean}`;
  return `+91${clean}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/send-otp
// ─────────────────────────────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const phone = normalisePhone(req.body.phone);
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required.' });

    const otp = makeOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTPs for this phone, then insert new one
    await prisma.otp.deleteMany({ where: { phone } });
    await prisma.otp.create({ data: { phone, otp, expiresAt } });

    // Send via Twilio
    const useMock = process.env.TWILIO_MOCK_MODE === 'true' ||
                    !process.env.TWILIO_ACCOUNT_SID ||
                    !process.env.TWILIO_AUTH_TOKEN;

    if (useMock) {
      console.log(`\n[MOCK OTP] ${phone} → ${otp}\n`);
      return res.json({ success: true, message: 'OTP sent (MOCK)', debugOtp: otp });
    }

    try {
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilioClient.messages.create({
        body: `Your Chardho Go code: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to:   phone
      });
      return res.json({ success: true, message: 'OTP sent' });
    } catch (smsErr) {
      console.error('Twilio error:', smsErr.message);
      return res.json({ success: true, message: 'OTP generated (SMS failed)', debugOtp: otp });
    }
  } catch (err) {
    console.error('sendOTP error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/verify-otp
// Body: { phone, otp, role? }   role defaults to 'client'
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const phone = normalisePhone(req.body.phone);
    const { otp, role } = req.body;
    const requestedRole = role || 'user';

    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP are required.' });
    }

    // 1. Validate OTP (check it exists and hasn't expired)
    console.log(`[Auth DB Check] Searching for phone: ${phone}, OTP: ${otp}`);
    const record = await prisma.otp.findFirst({
      where: { phone, otp, expiresAt: { gt: new Date() } }
    });
    
    if (!record) {
      const anyRecord = await prisma.otp.findFirst({ where: { phone } });
      if (anyRecord) {
        console.warn(`[Auth DB Check] OTP record found but mismatch. DB has: ${anyRecord.otp}, expiry: ${anyRecord.expiresAt}`);
      } else {
        console.warn(`[Auth DB Check] No OTP record found for this phone.`);
      }
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP.' });
    }
    await prisma.otp.deleteMany({ where: { phone } }); // single-use

    // 2. Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      console.log(`[Auth] Creating NEW user for ${phone} with role: ${requestedRole}`);
      user = await prisma.user.create({
        data: { phone, role: requestedRole }
      });
      // Sync to Mongo
      await syncToMongo(user.id, { phone, role: user.role, createdAt: new Date() });
    } else {
      console.log(`[Auth] Existing user ${user.id} found. Current role: ${user.role}, Requested: ${requestedRole}`);
      if (requestedRole !== user.role) {
        console.log(`[Auth] Updating role to ${requestedRole} for user ${user.id}`);
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { role: requestedRole }
        });
        // Update Mongo too
        await syncToMongo(user.id, { role: requestedRole });
      }
    }

    // 3. If driver — check approval status via driver-service
    let dStatus = null;
    if (user.role === 'driver') {
      try {
        const axios = require('axios');
        const driverServiceUrl = process.env.DRIVER_SERVICE_URL || 'http://127.0.0.1:5002';
        const encodedPhone = encodeURIComponent(phone);
        const resp = await axios.get(`${driverServiceUrl}/internal/driver-by-phone/${encodedPhone}`, {
          timeout: 4000
        });
        if (resp.data?.success) {
          dStatus = resp.data.data?.verificationStatus;
          if (dStatus && dStatus !== 'APPROVED') {
            return res.status(403).json({
              success: false,
              message: `Your profile is ${dStatus.replace('_', ' ')}. Please wait for admin approval.`,
              status: dStatus
            });
          }
        }
      } catch (e) {
        // Driver service unreachable or no profile yet — allow login; frontend handles onboarding
        console.warn('⚠️  Driver service check skipped:', e.message);
      }
    }

    // 4. Issue JWT
    const token = generateToken(
      { id: user.id, phone: user.phone, role: user.role },
      '2d' // 2 days expiration as requested
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days in ms
    });

    return res.json({
      success: true,
      token, // Include token for localStorage-based apps
      userId: user.id,
      role:   user.role,
      phone:  user.phone,
      isOnboarded: user.role === 'user'
        ? !!user.name
        : !!dStatus // If dStatus is not null, they have a driver profile
    });
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/me   (protected)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      include: { userProfile: true }
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    let dStatus = null;
    if (user.role === 'driver') {
      try {
        const axios = require('axios');
        const driverServiceUrl = process.env.DRIVER_SERVICE_URL || 'http://127.0.0.1:5002';
        const encodedPhone = encodeURIComponent(user.phone);
        const resp = await axios.get(`${driverServiceUrl}/internal/driver-by-phone/${encodedPhone}`, { timeout: 2000 });
        if (resp.data?.success) dStatus = resp.data.data?.verificationStatus;
      } catch (e) {
        console.warn('⚠️  Driver check failed in getMe:', e.message);
      }
    }

    res.json({ 
      success: true, 
      data: {
        ...user,
        isOnboarded: user.role === 'user' ? !!user.name : !!dStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout (protected)
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
  });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /auth/me   (protected) — update own name/email & preferences
// ─────────────────────────────────────────────────────────────────────────────
exports.updateMe = async (req, res) => {
  try {
    const { name, email, role, profilePhoto, favorites, dataSharing, pushNotifs, biometricEnabled, webAuthnCreds } = req.body;
    
    // 1. Update Core User Identity
    const userUpdates = {};
    if (name  !== undefined) userUpdates.name  = name;
    if (email !== undefined) userUpdates.email = email;
    if (role  !== undefined) userUpdates.role  = role;

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: req.user.id },
        data:  userUpdates
      });
    }

    // 2. Upsert Client Profile (Settings & Preferences)
    const profileUpdates = {};
    if (profilePhoto !== undefined) profileUpdates.profilePhoto = profilePhoto;
    if (favorites !== undefined)    profileUpdates.favorites    = favorites;
    if (dataSharing !== undefined)  profileUpdates.dataSharing  = dataSharing;
    if (pushNotifs !== undefined) profileUpdates.pushNotifs = pushNotifs;
    if (biometricEnabled !== undefined) profileUpdates.biometricEnabled = biometricEnabled;
    if (webAuthnCreds !== undefined) profileUpdates.webAuthnCreds = webAuthnCreds;

    if (Object.keys(profileUpdates).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: req.user.id },
        update: profileUpdates,
        create: {
          userId: req.user.id,
          ...profileUpdates
        }
      });
    }

    // 3. Return Combined Object
    const fullUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { userProfile: true }
    });

    // 4. Sync All to MongoDB
    await syncToMongo(req.user.id, {
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      phone: fullUser.phone,
      profilePhoto: fullUser.userProfile?.profilePhoto,
      favorites: fullUser.userProfile?.favorites,
      preferences: {
        dataSharing: fullUser.userProfile?.dataSharing,
        pushNotifs: fullUser.userProfile?.pushNotifs
      },
      biometricEnabled: fullUser.userProfile?.biometricEnabled
    });

    res.json({ success: true, data: fullUser });
  } catch (err) {
    console.error('UpdateMe Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/users  (admin only — returns all users)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /auth/users/:id  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
