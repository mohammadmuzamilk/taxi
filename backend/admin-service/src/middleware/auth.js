const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const protectAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Bypass DB lookup for hardcoded admin
    if (decoded.id === 'admin-hardcoded' && decoded.role === 'admin') {
      req.user = {
        id: 'admin-hardcoded',
        name: 'Super Admin',
        phone: '7893178596',
        role: 'admin',
        isActive: true,
      };
      return next();
    }

    // Standard DB lookup for real users
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protectAdmin };
