const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('user', 'admin'));

router.get('/profile', getProfile);
router.put('/update-profile', updateProfile);

module.exports = router;
