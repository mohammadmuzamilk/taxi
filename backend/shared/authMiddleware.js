const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chardho_go_super_secret_fallback_key';

/**
 * protect — verifies the Bearer token and attaches `req.user`
 * Attaches: { id, phone, role }
 */
exports.protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, phone, role }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Your session has expired. Please log in again.'
      : 'Invalid token. Please log in again.';
    return res.status(401).json({ success: false, error: message });
  }
};

/**
 * authorize — restricts access to specified roles
 * Usage: authorize('driver'), authorize('admin'), authorize('client', 'admin')
 */
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. This route is for [${allowedRoles.join(', ')}] only. Your role: '${req.user.role}'.`
      });
    }

    next();
  };
};

/**
 * generateToken — creates a signed JWT
 * @param {Object} payload  - { id, phone, role }
 * @param {string} expiresIn - e.g. '7d', '30d'
 */
exports.generateToken = (payload, expiresIn = '30d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
