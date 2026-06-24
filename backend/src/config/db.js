import mongoose from 'mongoose';
import dns from 'dns';
import { migrateStudentNames, migrateStudentGenders } from '../utils/migration.js';

// Force DNS resolution to use Google's Public DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('DNS Resolver set to Google Public DNS (8.8.8.8)');
} catch (dnsErr) {
  console.warn('Could not set custom DNS resolver:', dnsErr.message);
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/school_erp';
  try {
    console.log('Connecting to primary MongoDB URI...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Run student migrations
    await migrateStudentNames();
    await migrateStudentGenders();
  } catch (error) {
    console.error(`Primary Database Connection Failed: ${error.message}`);
    console.log('Attempting connection to local fallback MongoDB (mongodb://127.0.0.1:27017/school_erp)...');
    try {
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
      
      // Run student migrations
      await migrateStudentNames();
      await migrateStudentGenders();
    } catch (localError) {
      console.error(`Local Fallback Database Connection Failed: ${localError.message}`);
      console.error('Please verify your network access or ensure your IP address is whitelisted in MongoDB Atlas.');
      process.exit(1);
    }
  }
};

export default connectDB;
