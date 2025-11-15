import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

export const connectDatabase = async () => {
  if (!MONGODB_URI) {
    throw new Error('Missing MongoDB connection string. Set MONGODB_URI or DATABASE_URL.');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connected successfully');
  console.log(`📦 Database: ${MONGODB_URI.split('/').pop()}`);
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error: Error) => {
  console.error('❌ MongoDB error:', error);
});

export default mongoose;

