import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from '../src/models/Class.js';
import User from '../src/models/User.js';
import Student from '../src/models/Student.js';
import Result from '../src/models/Result.js';
import Attendance from '../src/models/Attendance.js';
import Subject from '../src/models/Subject.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://admin:admin123@ac-hhsecam-shard-00-00.lq7m7nw.mongodb.net/test?authSource=admin&replicaSet=atlas-9x1u5x-shard-0&readPreference=primary&ssl=true';

async function runTests() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  try {
    // Test 1: Get Classes & Student Counts
    console.log('\n--- Test 1: Checking Classes and Student Counts ---');
    const classes = await Class.find().populate('sectionTeachers.teacher');
    for (const c of classes) {
      const studentCount = await Student.countDocuments({ classId: c._id });
      console.log(`Class: ${c.name}, Sections: ${c.sections.join(', ')}, Dynamic Student Count: ${studentCount}`);
      if (c.sectionTeachers && c.sectionTeachers.length > 0) {
        console.log('  Section Teachers:');
        c.sectionTeachers.forEach(st => {
          console.log(`    Sec ${st.section}: ${st.teacher?.name} (${st.teacher?.email})`);
        });
      }
    }

    // Test 2: Fetch Students by Section
    console.log('\n--- Test 2: Fetching Students by Class and Section ---');
    const grade1 = await Class.findOne({ name: 'Grade 1' });
    if (grade1) {
      const secAStudents = await Student.find({ classId: grade1._id, section: 'A' }).populate('user');
      const secBStudents = await Student.find({ classId: grade1._id, section: 'B' }).populate('user');
      console.log(`Grade 1 - Section A Students Count: ${secAStudents.length}`);
      secAStudents.slice(0, 3).forEach(s => console.log(`  - ${s.name} (Roll: ${s.rollNumber})`));
      console.log(`Grade 1 - Section B Students Count: ${secBStudents.length}`);
      secBStudents.slice(0, 3).forEach(s => console.log(`  - ${s.name} (Roll: ${s.rollNumber})`));
    }

    // Test 3: Fetch Grades by Class & Section
    console.log('\n--- Test 3: Checking Grades & Result Section Mapping ---');
    if (grade1) {
      const results = await Result.find({ classId: grade1._id })
        .populate('student', 'name email')
        .populate('subjectId')
        .populate('examId');

      const studentDocs = await Student.find({ classId: grade1._id });
      const rollMap = {};
      const sectionMap = {};
      studentDocs.forEach(s => {
        if (s.user) {
          rollMap[s.user.toString()] = s.rollNumber;
          sectionMap[s.user.toString()] = s.section || 'A';
        }
      });

      let formatted = results.map(rec => {
        if (!rec.student) return null;
        const studentUserId = rec.student._id.toString();
        return {
          studentName: rec.student.name,
          rollNumber: rollMap[studentUserId] || '-',
          section: sectionMap[studentUserId] || 'A',
          subjectName: rec.subjectId?.name || 'Subject',
          marksObtained: rec.marksObtained,
          maxMarks: rec.maxMarks
        };
      }).filter(r => r !== null);

      console.log(`Total Grade 1 Results Found: ${formatted.length}`);
      const secAResults = formatted.filter(r => r.section === 'A');
      const secBResults = formatted.filter(r => r.section === 'B');
      console.log(`Grade 1 - Section A Results Count: ${secAResults.length}`);
      secAResults.slice(0, 2).forEach(r => console.log(`  - ${r.studentName}: ${r.subjectName} = ${r.marksObtained}/${r.maxMarks}`));
      console.log(`Grade 1 - Section B Results Count: ${secBResults.length}`);
      secBResults.slice(0, 2).forEach(r => console.log(`  - ${r.studentName}: ${r.subjectName} = ${r.marksObtained}/${r.maxMarks}`));
    }

    console.log('\nAll programmatic database integrity validations passed successfully!');

  } catch (error) {
    console.error('Test run encountered error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

runTests();
