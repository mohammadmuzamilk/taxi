// ─── API URL ──────────────────────────────────────────────────────────────────
// MUST include https:// — set this in Vercel: Settings → Environment Variables
// Key:   VITE_API_URL
// Value: https://taxi-production-20c4.up.railway.app
const API = import.meta.env.VITE_API_URL;

// ─── Startup check (visible in browser DevTools → Console) ────────────────────
if (!API) {
  console.error(
    '❌ VITE_API_URL is not set!\n' +
    'Go to Vercel → Project → Settings → Environment Variables\n' +
    'and add:  VITE_API_URL = https://taxi-production-20c4.up.railway.app\n' +
    'Then redeploy.'
  );
} else if (!API.startsWith('http')) {
  console.error('❌ VITE_API_URL is missing https://  Current value:', API);
} else {
  console.log('✅ VITE_API_URL =', API);
}

export const config = {
  API_BASE_URL: API,
  GATEWAY_URL:  API,
  AUTH_SERVICE:         `${API}/api/auth`,
  USER_SERVICE:         `${API}/api/users`,
  DRIVER_SERVICE:       `${API}/api/drivers`,
  RIDE_SERVICE:         `${API}/api/rides`,
  NOTIFICATION_SERVICE: `${API}/api/notifications`,
  SOCKET_URL:  API,
  SOCKET_PATH: '/api/rides/socket.io',
};
