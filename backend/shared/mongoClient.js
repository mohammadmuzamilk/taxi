const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'chardho_go_realtime';

const client = new MongoClient(url);

let db = null;

async function connect(retries = 5) {
  if (db) return db;
  
  while (retries > 0) {
    try {
      console.log(`🔌 Attempting MongoDB connection... (${retries} attempts left)`);
      await client.connect();
      console.log('✅ Connected to MongoDB (Realtime State)');
      db = client.db(dbName);
      
      // Setup indexes for geolocation and TTL (OTP)
      await db.collection('drivers_locations').createIndex({ location: "2dsphere" });
      await db.collection('otps').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
      await db.collection('notifications').createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
      
      return db;
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
      retries -= 1;
      if (retries === 0) throw err;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

module.exports = {
  getDb: connect,
  client
};
