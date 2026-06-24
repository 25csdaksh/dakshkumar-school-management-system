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
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    const result = await Student.updateOne(
      { rollNumber: '2026002' },
      { $set: { gender: 'Female' } }
    );
    console.log(`Updated Riya Soni's gender to Female. Modified count: ${result.modifiedCount}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
