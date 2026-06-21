import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

import Result from '../src/models/Result.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const results = await Result.find({}).populate('student').populate('subjectId').populate('examId');
    console.log(`Found ${results.length} results:`);
    for (const r of results) {
      console.log(`Result ID: ${r._id}`);
      console.log(`  Student: ${r.student?.name} (${r.student?._id})`);
      console.log(`  Subject ID: ${r.subjectId?._id}, Name: ${r.subjectId?.name || 'Null/Undefined'}`);
      console.log(`  Exam ID: ${r.examId?._id}, Name: ${r.examId?.name}`);
      console.log(`  Marks: ${r.marksObtained} / ${r.maxMarks}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
