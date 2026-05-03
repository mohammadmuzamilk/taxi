require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors    = require('cors');
const morgan  = require('morgan');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const productionOrigins = [
  'https://taxi-chi-six.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const localOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:5174',
  'https://localhost:5174',
  'http://localhost:5175',
  'https://localhost:5175',
  'http://localhost:5176',
  'https://localhost:5176',
  'http://localhost:3000',
  'https://localhost:3000',
  // LAN IP for mobile/device testing — allow all
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if ([...productionOrigins, ...localOrigins].includes(origin)) return cb(null, true);
    // Allow any private LAN IP (for mobile testing on same Wi-Fi)
    if (/^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(morgan('dev'));

// ── Service URLs ──────────────────────────────────────────────────────────────
const services = {
  client:       process.env.CLIENT_SERVICE_URL       || 'http://127.0.0.1:5001',
  driver:       process.env.DRIVER_SERVICE_URL       || 'http://127.0.0.1:5002',
  admin:        process.env.ADMIN_SERVICE_URL        || 'http://127.0.0.1:5003',
  ride:         process.env.RIDE_SERVICE_URL         || 'http://127.0.0.1:5005',
  tracking:     process.env.TRACKING_SERVICE_URL     || 'http://127.0.0.1:5006',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:5007',
};

// ── Shared error handler ──────────────────────────────────────────────────────
// IMPORTANT: The `res` in a proxy error can be either:
//   • http.ServerResponse  (HTTP request)  → has writeHead / end / headersSent
//   • net.Socket           (WS upgrade)    → has destroy, but NO writeHead
// NEVER use res.status() here — that's Express-only and not always present.
const proxyErrorHandler = (err, req, res) => {
  const url = req?.originalUrl || req?.url || '(unknown)';
  console.error('🔥 Proxy Error:', err.code || err.message, '→', url);

  try {
    if (res && typeof res.writeHead === 'function' && !res.headersSent) {
      // HTTP response — send a proper 504 JSON so the browser always gets a response
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Service unavailable. Please try again.',
        error:   err.message
      }));
    } else if (res && typeof res.destroy === 'function') {
      // Raw socket (WebSocket upgrade) — just close it cleanly
      res.destroy();
    } else if (res && typeof res.end === 'function') {
      res.end();
    }
  } catch (handlerErr) {
    console.error('proxyErrorHandler itself threw:', handlerErr.message);
  }
};

// ── Proxy factory ─────────────────────────────────────────────────────────────
const makeProxy = (context, target, pathRewrite, wsEnabled = false) =>
  createProxyMiddleware({
    target,
    pathFilter: context,
    changeOrigin: true,
    ws: wsEnabled,
    logger: console,
    proxyTimeout: 10000,
    timeout:      10000,
    pathRewrite,
    on: { 
      error: proxyErrorHandler,
      proxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Forwarding ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
      }
    }
  });

// ── Proxy instances ───────────────────────────────────────────────────────────
const driverProxy      = makeProxy('/api/drivers', services.driver, {}, true);
const ridesSocketProxy = makeProxy('/api/rides/socket.io', services.driver, { '^/api/rides': '/api/drivers' }, true);
const trackingProxy    = makeProxy('/api/tracking', services.tracking, {}, true);

// ── Routes ───────────────────────────────────────────────────────────────────

// New Ride Service (REST) → ride-service
app.use(makeProxy('/api/rides/v2', services.ride, {}));

// Auth & Rides v1 → client-service
app.use(makeProxy('/api/auth', services.client, {}));
app.use(makeProxy('/api/rides', services.client, {}));

// Rides socket.io compat path (must come BEFORE the generic /api/rides proxy)
app.use(ridesSocketProxy);

// Drivers (REST + Socket.IO) → driver-service
app.use(driverProxy);

// Tracking (Socket.IO) → tracking-service
app.use(trackingProxy);

// Notifications → notification-service
app.use(makeProxy('/api/notifications', services.notification, {}));

// Admin → admin-service
app.use(makeProxy('/api/admin', services.admin, {}));

// Health
app.get('/health', (_, res) => res.json({
  status: 'API Gateway OK',
  services,
  routes: [
    'POST /api/auth/send-otp  → client-service',
    'POST /api/auth/verify-otp → client-service',
    'GET  /api/drivers/*      → driver-service',
    'GET  /api/rides/*        → client-service',
    'GET  /api/admin/*        → admin-service',
  ]
}));

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// Global error
app.use((err, req, res, next) => {
  console.error('🔥 Gateway Error:', err.message);
  if (!res.headersSent) res.status(500).json({ success: false, error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT   = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`\n🌐 API Gateway running on port ${PORT}`);
  console.log(`   Client  → ${services.client}`);
  console.log(`   Driver  → ${services.driver}`);
  console.log(`   Admin   → ${services.admin}`);
});

// ── WebSocket upgrade — SINGLE handler, routes by path ───────────────────────
// Only one proxy must handle each WS upgrade. If both fire on the same request
// you get "Invalid frame header" because the socket gets used twice.
server.on('upgrade', (req, socket, head) => {
  const url = req.url || '';

  if (url.startsWith('/api/drivers')) {
    console.log('↑ WS upgrade → driver-service:', url);
    driverProxy.upgrade(req, socket, head);
  } else if (url.startsWith('/api/rides')) {
    console.log('↑ WS upgrade → driver-service (rides compat):', url);
    ridesSocketProxy.upgrade(req, socket, head);
  } else if (url.startsWith('/api/tracking')) {
    console.log('↑ WS upgrade → tracking-service:', url);
    trackingProxy.upgrade(req, socket, head);
  } else {
    // Unknown WS path — reject cleanly
    console.warn('✗ WS upgrade rejected (unknown path):', url);
    socket.destroy();
  }
});

