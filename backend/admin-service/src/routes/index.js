const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const driverRoutes = require('./driverRoutes');
const rideRoutes = require('./rideRoutes');
const userRoutes = require('./userRoutes');
const paymentRoutes = require('./paymentRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
