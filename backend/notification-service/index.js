require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDb } = require('../shared/mongoClient');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes for manual triggering (like SOS)
app.use('/', notificationRoutes);

// MongoDB Change Streams listener for automated notifications
async function startWatching() {
  const db = await getDb();
  console.log('🔔 Notification Service watching for alerts in MongoDB...');
  
  const changeStream = db.collection('notifications').watch();
  
  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const data = change.fullDocument;
      // Mock sending logic
      console.log(`[NOTIFICATION SERVICE] Sending ${data.type} to ${data.recipientId || 'Admin'}: ${data.message}`);
    }
  });

  changeStream.on('error', (err) => {
    console.warn('⚠️ MongoDB Watch Error in Notification Service. Falling back to polling.');
    setInterval(async () => {
      const recent = await db.collection('notifications').find({
        createdAt: { $gt: new Date(Date.now() - 10000) }
      }).toArray();
      recent.forEach(data => {
        console.log(`[NOTIFICATION POLLING] Sending ${data.type} to ${data.recipientId || 'Admin'}: ${data.message}`);
      });
    }, 10000);
  });
}

startWatching().catch(err => {
  console.error('❌ Notification Service: Failed to start MongoDB watcher:', err.message);
});

app.get('/health', async (req, res) => {
  try {
    const db = await getDb();
    res.json({ status: 'ok', service: 'notification-service', mongodb: db ? 'connected' : 'error' });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'notification-service', mongodb: err.message });
  }
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
