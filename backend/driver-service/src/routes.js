const express = require('express');
const router = express.Router();
const auth = require('../../shared/authMiddleware');
const ctrl = require('./driverController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// ── Public routes ────────────────────────────────────────────────────────────
router.get('/', (req, res) => res.json({ success: true, message: 'Driver Service Root OK' }));
router.post('/register', upload.any(), ctrl.register);
router.get('/check/:phone', ctrl.checkDriver);

// ── Internal route (no auth — called only from client-service on same network) ──
// In production, restrict this via firewall / internal DNS; never expose via gateway
router.get('/internal/driver-by-phone/:phone', ctrl.getByPhone);

// ── Driver-only routes ────────────────────────────────────────────────────────
router.get('/profile',    auth.protect, auth.authorize('driver'), ctrl.getProfile);
router.put('/profile',    auth.protect, auth.authorize('driver'), ctrl.updateProfile);
router.post('/status',    auth.protect, auth.authorize('driver'), ctrl.updateStatus);
router.get('/earnings',   auth.protect, auth.authorize('driver'), ctrl.getEarnings);
router.get('/trips',      auth.protect, auth.authorize('driver'), ctrl.getTrips);

// ── Proxy to New Ride Service ───────────────────────────────────────────────
router.post('/accept-ride', auth.protect, auth.authorize('driver'), ctrl.proxyAcceptRide);
router.post('/reject-ride', auth.protect, auth.authorize('driver'), ctrl.proxyRejectRide);
router.post('/start-ride',  auth.protect, auth.authorize('driver'), ctrl.proxyStartRide);
// ── Admin routes — auth.protect only (admin panel has no login UI yet) ────────
router.get('/all',          ctrl.getAllDrivers);           // open for admin panel
router.patch('/verify/:id', auth.protect, ctrl.verifyDriver); // needs any valid token

module.exports = router;
