import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/school_erp';
  try {
    console.log('Connecting to primary MongoDB URI...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary Database Connection Failed: ${error.message}`);
    console.log('Attempting connection to local fallback MongoDB (mongodb://127.0.0.1:27017/school_erp)...');
    try {
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (localError) {
      console.error(`Local Fallback Database Connection Failed: ${localError.message}`);
      console.error('Please verify your network access or ensure your IP address is whitelisted in MongoDB Atlas.');
      process.exit(1);
    }
  }
};

export default connectDB;
