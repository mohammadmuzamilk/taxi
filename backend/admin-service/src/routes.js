const express = require('express');
const router = express.Router();
const auth = require('../../shared/authMiddleware');
const ctrl = require('./adminController');

// All admin routes: must be authenticated + admin role
router.use(auth.protect);
router.use(auth.authorize('admin'));

router.get('/users',                ctrl.getAllUsers);
router.delete('/users/:id',         ctrl.deleteUser);
router.get('/drivers',              ctrl.getAllDrivers);
router.patch('/drivers/:id/verify', ctrl.verifyDriver);

module.exports = router;
