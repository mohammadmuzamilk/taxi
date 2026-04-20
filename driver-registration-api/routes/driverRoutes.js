const express = require('express');
const router = express.Router();
const { registerDriver } = require('../controllers/driverController');

// Define the registration route
router.post('/register', registerDriver);

module.exports = router;
