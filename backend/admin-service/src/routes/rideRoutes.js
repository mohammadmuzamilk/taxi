const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { protectAdmin } = require('../middleware/auth');

router.get('/', protectAdmin, rideController.getRides);
router.post('/assign-driver', protectAdmin, rideController.assignDriver);
router.post('/:id/cancel', protectAdmin, rideController.cancelRide);

module.exports = router;
