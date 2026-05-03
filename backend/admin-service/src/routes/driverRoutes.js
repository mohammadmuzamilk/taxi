const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protectAdmin } = require('../middleware/auth');

router.get('/', protectAdmin, driverController.getDrivers);
router.post('/update-status', protectAdmin, driverController.updateStatus);
router.patch('/:id/toggle-active', protectAdmin, driverController.toggleActive);

module.exports = router;
