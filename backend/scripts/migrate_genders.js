import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

import Student from '../src/models/Student.js';

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_erp';
    console.log(`Connecting to database...`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    console.log('Migrating student genders...');
    const result = await Student.updateMany(
      {
        $or: [
          { gender: { $exists: false } },
          { gender: null },
          { gender: '' }
        ]
      },
      { $set: { gender: 'Male' } }
    );

    console.log(`Migration complete! Successfully updated ${result.modifiedCount} student records.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

run();
