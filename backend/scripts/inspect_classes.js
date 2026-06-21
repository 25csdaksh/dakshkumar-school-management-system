import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

import Class from '../src/models/Class.js';
import Subject from '../src/models/Subject.js';
import User from '../src/models/User.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const classes = await Class.find({}).populate('subjects.subject').populate('subjects.teacher').populate('classTeacher');
    console.log(`Found ${classes.length} classes:`);
    for (const c of classes) {
      console.log(`Class ID: ${c._id}, Name: ${c.name}`);
      console.log(`  Class Teacher: ${c.classTeacher?.name || 'Unassigned'}`);
      console.log(`  Subjects Count: ${c.subjects.length}`);
      for (const s of c.subjects) {
        console.log(`    - Subject ref ID: ${s.subject?._id || s.subject}, Name: ${s.subject?.name || 'Null/Undefined'}, Code: ${s.subject?.code || 'Null'}, Teacher: ${s.teacher?.name || 'Unassigned'}`);
      }
    }

    const subjects = await Subject.find({});
    console.log(`Found ${subjects.length} subjects in total:`);
    for (const sub of subjects) {
      console.log(`  - Subject ID: ${sub._id}, Name: ${sub.name}, Code: ${sub.code}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
