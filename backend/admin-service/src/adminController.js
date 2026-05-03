const axios = require('axios');

const CLIENT  = () => process.env.CLIENT_SERVICE_URL  || 'http://127.0.0.1:5001';
const DRIVER  = () => process.env.DRIVER_SERVICE_URL  || 'http://127.0.0.1:5002';

// Forward the admin's auth token to downstream services
const fwd = (req) => ({ headers: { Authorization: req.headers.authorization } });

// ── GET /admin/users ─────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const r = await axios.get(`${CLIENT()}/auth/users`, fwd(req));
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json({ success: false, error: err.response?.data?.error || err.message });
  }
};

// ── DELETE /admin/users/:id ──────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const r = await axios.delete(`${CLIENT()}/auth/users/${req.params.id}`, fwd(req));
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json({ success: false, error: err.response?.data?.error || err.message });
  }
};

// ── GET /admin/drivers ───────────────────────────────────────────────────────
exports.getAllDrivers = async (req, res) => {
  try {
    const r = await axios.get(`${DRIVER()}/all`, fwd(req));
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json({ success: false, error: err.response?.data?.error || err.message });
  }
};

// ── PATCH /admin/drivers/:id/verify ─────────────────────────────────────────
exports.verifyDriver = async (req, res) => {
  try {
    const r = await axios.patch(`${DRIVER()}/verify/${req.params.id}`, req.body, fwd(req));
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json({ success: false, error: err.response?.data?.error || err.message });
  }
};
