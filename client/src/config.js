const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

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
