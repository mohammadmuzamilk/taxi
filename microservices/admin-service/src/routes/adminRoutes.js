const express = require('express');
const { getAllUsers, getAllDrivers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/all-users', getAllUsers);
router.get('/all-drivers', getAllDrivers);
router.delete('/user/:id', deleteUser);

module.exports = router;
