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

    // Find teacher sachin patel
    const teacher = await User.findOne({ name: 'sachin patel' });
    if (!teacher) {
      console.log('Teacher not found');
      return;
    }

    console.log(`Teacher found: ${teacher._id} (${teacher.name})`);

    // Let's assign a subject to Grade 1 with this teacher if not already done
    const grade1 = await Class.findOne({ name: 'Grade 1' });
    if (grade1) {
      console.log('Grade 1 found.');
      // Find or create a subject
      let mathSub = await Subject.findOne({ name: 'Mathematics' });
      if (!mathSub) {
        mathSub = new Subject({ name: 'Mathematics', code: 'MATH101' });
        await mathSub.save();
      }

      // Assign subject to Grade 1 with teacher sachin patel
      const alreadyAssigned = grade1.subjects.some(s => s.subject.toString() === mathSub._id.toString());
      if (!alreadyAssigned) {
        grade1.subjects.push({
          subject: mathSub._id,
          teacher: teacher._id
        });
        await grade1.save();
        console.log('Assigned Mathematics to Grade 1 with sachin patel.');
      }
    }

    // Now call the query that getAssignedClasses uses:
    const classes = await Class.find({
      $or: [
        { classTeacher: teacher._id },
        { 'subjects.teacher': teacher._id }
      ]
    })
    .populate('classTeacher', 'name email')
    .populate('subjects.subject');

    console.log(`Query returned ${classes.length} classes for this teacher:`);
    for (const c of classes) {
      console.log(`Class: ${c.name}`);
      console.log('Subjects array:', JSON.stringify(c.subjects, null, 2));
      const formattedSubjects = c.subjects.map(subItem => ({
        name: subItem.subject?.name || 'Subject',
        teacher: subItem.teacher
      }));
      console.log('Formatted subjects:', formattedSubjects);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
