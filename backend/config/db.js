const mongoose = require('mongoose');

const MAX_RETRIES = 8;
const RETRY_MS = 3000;

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-project-planner';

  const attemptConnect = async (attempt = 1) => {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
    } catch (err) {
      console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
      if (attempt < MAX_RETRIES) {
        setTimeout(() => attemptConnect(attempt + 1), RETRY_MS);
      } else {
        console.error(
          'Could not connect to MongoDB. API stays up; task routes return 503 until DB is available.'
        );
      }
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — retrying…');
    attemptConnect(1);
  });

  await attemptConnect(1);
}

module.exports = connectDB;
module.exports.isDbReady = isDbReady;
