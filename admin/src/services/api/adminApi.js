import api from './index';

export const adminApi = {
  // Auth
  login: (data) => api.post('/auth/login', data),

  // Dashboard
  getSummary: () => api.get('/dashboard/summary'),

  // Drivers
  getDrivers: () => api.get('/drivers'),
  updateDriverStatus: (data) => api.post('/drivers/update-status', data),
  toggleDriverActive: (id, isActive) => api.patch(`/drivers/${id}/toggle-active`, { isActive }),

  // Rides
  getRides: () => api.get('/rides'),
  assignDriver: (data) => api.post('/rides/assign-driver', data),
  cancelRide: (id, reason) => api.post(`/rides/${id}/cancel`, { reason }),

  // Users
  getUsers: () => api.get('/users'),
  toggleUserActive: (id, isActive) => api.patch(`/users/${id}/toggle-active`, { isActive }),

  // Payments
  getPaymentStats: () => api.get('/payments/stats'),
  getRecentPayments: () => api.get('/payments/recent'),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.patch('/settings', data),
};
