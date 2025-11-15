import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/swiftwallet';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${MONGODB_URI.split('/').pop()}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Make sure MongoDB is running and accessible');
    console.error('💡 MongoDB URI:', MONGODB_URI);
    // Don't exit - let server start anyway
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error: Error) => {
  console.error('❌ MongoDB error:', error);
});

export default mongoose;

