const express = require('express');
const router = express.Router();
const auth = require('../../../shared/authMiddleware');
const rideController = require('../controllers/rideController');

// User endpoints
router.post('/book', auth.protect, auth.authorize('user', 'driver'), rideController.bookRide);
router.post('/schedule', auth.protect, auth.authorize('user', 'driver'), rideController.scheduleRide);
router.get('/active', auth.protect, rideController.getActiveRide);
router.post('/:rideId/start-otp', auth.protect, auth.authorize('driver'), rideController.verifyOtpAndStartRide);

// Driver endpoints
router.post('/:rideId/accept', auth.protect, auth.authorize('driver'), rideController.acceptRide);
router.post('/:rideId/reject', auth.protect, auth.authorize('driver'), rideController.rejectRide);

// Common endpoints
router.get('/nearby-drivers', auth.protect, rideController.getNearbyDrivers);
router.get('/:rideId', auth.protect, rideController.getRideDetails);
router.patch('/:rideId/status', auth.protect, rideController.updateRideStatus); // For arrival, completion, cancellation

module.exports = router;
