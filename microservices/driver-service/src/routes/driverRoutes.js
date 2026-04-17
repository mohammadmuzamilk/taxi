const express = require('express');
const { getDriverProfile, updateDriverStatus, getAllDrivers } = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/profile', authorize('driver', 'admin'), getDriverProfile);
router.post('/status', authorize('driver', 'admin'), updateDriverStatus);
router.get('/all', authorize('admin'), getAllDrivers);

module.exports = router;
