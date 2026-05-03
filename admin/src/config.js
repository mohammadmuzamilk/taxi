const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (import.meta.env.DEV) {
  console.log('✅ Admin → API Gateway:', API);
}

// Admin token stored in localStorage after admin login
export const getAdminToken = () => localStorage.getItem('adminToken');

export const config = {
  API_BASE_URL:   API,
  // All admin routes go through gateway → admin-service → forwarded to driver/client service
  ADMIN_SERVICE:  `${API}/api/admin`,
  DRIVER_SERVICE: `${API}/api/drivers`,   // for direct reads (GET /all, GET /profile)
};

