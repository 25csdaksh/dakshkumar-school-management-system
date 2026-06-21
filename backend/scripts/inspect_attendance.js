import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

import Attendance from '../src/models/Attendance.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const logs = await Attendance.find({}).populate('student').populate('classId');
    console.log(`Found ${logs.length} attendance records:`);
    for (const log of logs) {
      console.log(`Log ID: ${log._id}, Date: ${log.date}`);
      console.log(`  Student: ${log.student?.name} (${log.student?._id})`);
      console.log(`  Class: ${log.classId?.name}, Section: ${log.section}`);
      console.log(`  Status: ${log.status}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
