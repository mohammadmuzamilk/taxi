const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/drivers', require('./src/routes/driverRoutes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'Driver Service is Healthy' }));

const PORT = process.env.PORT || 5004;

const server = app.listen(PORT, () => {
  console.log(`\n👨‍✈️ Driver Service running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`\n❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
