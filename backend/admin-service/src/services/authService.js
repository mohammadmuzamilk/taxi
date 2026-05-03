const prisma = require('../prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (phone, password) => {
  console.log('Login attempt with:', { phone, password });
  
  const cleanPhone = phone?.trim();
  const cleanPassword = password?.trim();

  // Hardcoded Admin Bypass (Checks if it includes the number to handle +91)
  if (cleanPhone && cleanPhone.includes('7893178596') && cleanPassword === 'Muzamil&789') {
    const token = jwt.sign({ id: 'admin-hardcoded', role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '30d',
    });

    return {
      user: {
        id: 'admin-hardcoded',
        name: 'Super Admin',
        phone: cleanPhone,
        role: 'admin',
      },
      token,
    };
  }

  // Standard DB check
  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user || user.role !== 'admin') {
    const error = new Error('Invalid credentials or not an admin');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
};

module.exports = { login };
