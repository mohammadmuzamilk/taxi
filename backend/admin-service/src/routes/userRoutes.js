const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protectAdmin } = require('../middleware/auth');

router.get('/', protectAdmin, userController.getUsers);
router.patch('/:id/toggle-active', protectAdmin, userController.toggleActive);

module.exports = router;
