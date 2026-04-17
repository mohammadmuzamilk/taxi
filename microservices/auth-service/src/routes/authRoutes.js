const express = require('express');
const { signup, login, getUsers, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Admin only routes
router.get('/users', protect, authorize('admin'), getUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
