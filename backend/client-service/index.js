require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// No MongoDB — Prisma connects lazily on first query
const prisma = require('../shared/prismaClient');
const { getDb } = require('../shared/mongoClient');

const app = express();

const allowedOrigins = [
  'https://taxi-chi-six.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api', require('./src/routes'));

// Health check — also verifies DB connectivity
app.get('/health', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'Client Service OK', db: 'PostgreSQL connected' });
  } catch {
    res.status(503).json({ status: 'Client Service OK', db: 'PostgreSQL unavailable' });
  }
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Client Service Error:', err.stack);
  res.status(err.status || 500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`\n📱 Client Service running on port ${PORT} (PostgreSQL/Prisma)`));
