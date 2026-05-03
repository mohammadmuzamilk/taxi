const express = require('express');
const router = express.Router();
const auth = require('../../shared/authMiddleware');
const authCtrl = require('./authController');
const rideCtrl = require('./rideController');

// ── Auth routes (public) ────────────────────────────────────────────────────
router.post('/auth/send-otp',   authCtrl.sendOTP);
router.post('/auth/verify-otp', authCtrl.verifyOTP);

// ── Protected auth routes ───────────────────────────────────────────────────
router.get('/auth/me',          auth.protect, authCtrl.getMe);
router.put('/auth/me',          auth.protect, authCtrl.updateMe);   // update name/email
router.post('/auth/logout',     auth.protect, authCtrl.logout);

// Admin-only user management (forwarded from admin-service via internal call)
router.get('/auth/users',        auth.protect, auth.authorize('admin'), authCtrl.getAllUsers);
router.delete('/auth/users/:id', auth.protect, auth.authorize('admin'), authCtrl.deleteUser);

// ── Ride routes ─────────────────────────────────────────────────────────────
router.post('/rides/request',     auth.protect, auth.authorize('client'), rideCtrl.requestRide);
router.get('/rides/:id',          auth.protect, rideCtrl.getRide);
router.patch('/rides/:id/status', auth.protect, rideCtrl.updateRideStatus);

// ── Proxy to New Ride Service ───────────────────────────────────────────────
router.post('/book-ride',     auth.protect, auth.authorize('client'), rideCtrl.proxyBookRide);
router.post('/schedule-ride', auth.protect, auth.authorize('client'), rideCtrl.proxyScheduleRide);

// ── Internal driver-ride queries (called by driver-service, no auth gateway) ─
router.get('/rides/driver/:driverId/completed', rideCtrl.getDriverCompletedRides);
router.get('/rides/driver/:driverId/all',       rideCtrl.getDriverAllRides);

module.exports = router;

