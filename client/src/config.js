// ─── API URL ───────────────────────────────────────────────────────────────────
// Dev:        '' (empty) → requests go through Vite proxy → http://localhost:8000
// Production: set VITE_API_URL in your hosting env (e.g. Vercel)
const API = import.meta.env.VITE_API_URL || '';

if (import.meta.env.DEV) {
  console.log('✅ API requests proxied via Vite → http://localhost:8000');
}

export const config = {
  API_BASE_URL:   API,
  GATEWAY_URL:    API,

  // All routes go through the single API Gateway
  AUTH_SERVICE:   `${API}/api/auth`,
  RIDE_SERVICE:   `${API}/api/rides`,
  DRIVER_SERVICE: `${API}/api/drivers`,
  ADMIN_SERVICE:  `${API}/api/admin`,
  RIDE_V2:        `${API}/api/rides/v2`,
  NOTIFICATION:   `${API}/api/notifications`,

  // Socket.IO — always connect to the same origin (works under HTTP and HTTPS)
  // The Vite proxy forwards /api/drivers/socket.io → localhost:8000
  SOCKET_URL:  typeof window !== 'undefined' ? window.location.origin : (API || 'http://localhost:8000'),
  SOCKET_PATH: '/api/drivers/socket.io',

  TRACKING_URL:  typeof window !== 'undefined' ? window.location.origin : (API || 'http://localhost:8000'),
  TRACKING_PATH: '/api/tracking',
};
