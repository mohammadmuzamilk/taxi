// VITE_API_URL must include https:// in Vercel env vars
// Falls back to localhost:8000 for local development
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

console.log('--- ENV DEBUG ---');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('-----------------');

export const config = {
  API_BASE_URL,
  GATEWAY_URL: API_BASE_URL,
  // All services routed through the API gateway
  AUTH_SERVICE: `${API_BASE_URL}/api/auth`,
  USER_SERVICE: `${API_BASE_URL}/api/users`,
  DRIVER_SERVICE: `${API_BASE_URL}/api/drivers`,
  RIDE_SERVICE: `${API_BASE_URL}/api/rides`,
  NOTIFICATION_SERVICE: `${API_BASE_URL}/api/notifications`,
  // Socket.io configuration
  SOCKET_URL: API_BASE_URL,
  SOCKET_PATH: '/api/rides/socket.io'
};

