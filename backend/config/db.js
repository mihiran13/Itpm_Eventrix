const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in backend/.env');
  }

  const maxRetries = Number(process.env.DB_CONNECT_RETRIES || 5);
  const retryDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 3000);

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      lastError = error;
      console.error(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );

      if (attempt < maxRetries) {
        await delay(retryDelayMs);
      }
    }
  }

  throw lastError;
};

module.exports = connectDB;
