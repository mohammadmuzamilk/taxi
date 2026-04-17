const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas cluster using URI from environment.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`\n🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.warn('TIP: Your network may be blocking MONGO SRV records.');
      console.warn('ACTION: See mongodb_fix_guide.md to switch to the "Standard" connection string.');
    }
    
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
