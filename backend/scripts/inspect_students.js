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

    const students = await Student.find({});
    console.log(`Found ${students.length} students:`);
    students.forEach(s => {
      console.log(`Student name: ${s.name}, Roll: ${s.rollNumber}, Gender: "${s.gender}"`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
