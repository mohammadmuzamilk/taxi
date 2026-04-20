require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(morgan('dev'));

const PORT = process.env.PORT || 8000;

// Configuration for service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service.railway.internal:8080',
  user: process.env.USER_SERVICE_URL || 'http://user-service.railway.internal:8080',
  admin: process.env.ADMIN_SERVICE_URL || 'http://admin-service.railway.internal:8080',
  driver: process.env.DRIVER_SERVICE_URL || 'http://driver-service.railway.internal:8080',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service.railway.internal:8080',
  ride: process.env.RIDE_SERVICE_URL || 'http://ride-service.railway.internal:8080'
};

// Route definitions
app.use('/api/auth', createProxyMiddleware({ 
  target: services.auth, 
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));
app.use('/api/users', createProxyMiddleware({ target: services.user, changeOrigin: true }));
app.use('/api/admins', createProxyMiddleware({ target: services.admin, changeOrigin: true }));
app.use('/api/drivers', createProxyMiddleware({ target: services.driver, changeOrigin: true }));
app.use('/api/notifications', createProxyMiddleware({ target: services.notification, changeOrigin: true }));
const rideProxy = createProxyMiddleware({ 
  target: services.ride, 
  changeOrigin: true, 
  ws: true,
  pathRewrite: { '^/api/rides': '' }
});
app.use('/api/rides', rideProxy);

app.get('/health', (req, res) => res.status(200).json({ status: 'API Gateway is Healthy' }));

const server = app.listen(PORT, () => {
  console.log(`\n🌐 API Gateway running on port ${PORT}`);
  console.log(`Auth Service: ${services.auth}`);
  console.log(`User Service: ${services.user}`);
  console.log(`Admin Service: ${services.admin}`);
  console.log(`Driver Service: ${services.driver}`);
  console.log(`Notification Service: ${services.notification}`);
});

server.on('upgrade', rideProxy.upgrade);
