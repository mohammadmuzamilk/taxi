const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002/api/users';
const DRIVER_SERVICE_URL = process.env.DRIVER_SERVICE_URL || 'http://localhost:5004/api/drivers';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001/api/auth';

const getAxiosConfig = (req) => ({
  headers: {
    Authorization: req.headers.authorization
  }
});

// @desc    Get all users
// @route   GET /api/admin/all-users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    // We assume user-service has an admin endpoint or we fetch from auth-service
    const response = await axios.get(`${AUTH_SERVICE_URL}/users`, getAxiosConfig(req));
    res.status(200).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.error || err.message });
  }
};

// @desc    Get all drivers
// @route   GET /api/admin/all-drivers
// @access  Private (Admin)
exports.getAllDrivers = async (req, res, next) => {
  try {
    const response = await axios.get(`${DRIVER_SERVICE_URL}/all`, getAxiosConfig(req));
    res.status(200).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.error || err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const response = await axios.delete(`${AUTH_SERVICE_URL}/users/${req.params.id}`, getAxiosConfig(req));
    res.status(200).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.error || err.message });
  }
};
