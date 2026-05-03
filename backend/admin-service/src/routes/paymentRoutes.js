const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protectAdmin } = require('../middleware/auth');

router.get('/stats', protectAdmin, paymentController.getStats);
router.get('/recent', protectAdmin, paymentController.getRecent);

module.exports = router;
