const protocol = window.location.protocol;
const hostname = window.location.hostname;

// Priority: 
// 1. Environment Variable (VITE_API_BASE_URL)
// 2. Localhost fallback (if developing locally)
// 3. Current domain fallback (will likely fail in prod without env var, but fixes protocol)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                    (hostname === 'localhost' || hostname === '127.0.0.1' 
                     ? `http://${hostname}:8000` 
                     : `${protocol}//${hostname}`);

console.log('--- ENV DEBUG ---');
console.log('import.meta.env.VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Calculated API_BASE_URL:', API_BASE_URL);
console.log('-----------------');

export const config = {
  API_BASE_URL,
  GATEWAY_URL: API_BASE_URL,
  // Since we use the gateway, all services are reached through it
  AUTH_SERVICE: `${API_BASE_URL}/api/auth`,
  USER_SERVICE: `${API_BASE_URL}/api/users`,
  DRIVER_SERVICE: `${API_BASE_URL}/api/drivers`,
  RIDE_SERVICE: `${API_BASE_URL}/api/rides`,
  NOTIFICATION_SERVICE: `${API_BASE_URL}/api/notifications`,
  // Socket.io configuration
  SOCKET_URL: API_BASE_URL,
  SOCKET_PATH: '/api/rides/socket.io'
};
