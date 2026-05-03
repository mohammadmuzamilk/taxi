const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protectAdmin } = require('../middleware/auth');

router.get('/summary', protectAdmin, dashboardController.getSummary);

module.exports = router;
