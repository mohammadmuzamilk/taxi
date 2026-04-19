const express = require('express');
const router = express.Router();
const { requestRide, getRide, updateStatus } = require('../controllers/rideController');

router.post('/request', requestRide);
router.get('/:id', getRide);
router.patch('/:id/status', updateStatus);

module.exports = router;
