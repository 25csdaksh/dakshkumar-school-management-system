import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force DNS resolution to use Google's Public DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('DNS Resolver set to Google Public DNS (8.8.8.8) for seeding');
} catch (dnsErr) {
  console.warn('Could not set custom DNS resolver:', dnsErr.message);
}

dotenv.config();

// Models
import Permission from '../src/models/Permission.js';
import Role from '../src/models/Role.js';
import Subject from '../src/models/Subject.js';
import User from '../src/models/User.js';
import Student from '../src/models/Student.js';
import Teacher from '../src/models/Teacher.js';
import Class from '../src/models/Class.js';
import Attendance from '../src/models/Attendance.js';
import Fee from '../src/models/Fee.js';
import FeePayment from '../src/models/FeePayment.js';
import Exam from '../src/models/Exam.js';
import Result from '../src/models/Result.js';
import Homework from '../src/models/Homework.js';
import Notice from '../src/models/Notice.js';
import Event from '../src/models/Event.js';
import Book from '../src/models/Book.js';
import Hostel from '../src/models/Hostel.js';
import Inventory from '../src/models/Inventory.js';
import ActivityLog from '../src/models/ActivityLog.js';

const seedData = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/school_erp';
  try {
    console.log('Connecting to primary MongoDB for seeding...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected for 15-Collection Seeding...');
  } catch (error) {
    console.error(`Primary Database Connection Failed: ${error.message}`);
    console.log('Attempting connection to local fallback MongoDB...');
    try {
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('MongoDB Connected to local fallback for Seeding...');
    } catch (localError) {
      console.error(`Local Fallback Database Connection Failed: ${localError.message}`);
      process.exit(1);
    }
  }

  try {
    // Clear all collections
    const collections = [
      Permission, Role, Subject, User, Student, Teacher, Class,
      Attendance, Fee, FeePayment, Exam, Result, Homework, Notice,
      Event, Book, Hostel, Inventory, ActivityLog
    ];
    for (const model of collections) {
      await model.deleteMany({});
    }
    console.log('Cleared all collections.');

    // 1. Seed Permissions
    const p1 = await new Permission({ name: 'users:write', description: 'Create and delete users' }).save();
    const p2 = await new Permission({ name: 'attendance:mark', description: 'Mark student attendance' }).save();
    const p3 = await new Permission({ name: 'grades:write', description: 'Record student exam grades' }).save();
    const p4 = await new Permission({ name: 'fees:collect', description: 'Log fee collection and payments' }).save();
    console.log('Permissions seeded.');

    // 2. Seed Roles
    const adminRole = await new Role({ name: 'admin', permissions: [p1._id, p2._id, p3._id, p4._id] }).save();
    const teacherRole = await new Role({ name: 'teacher', permissions: [p2._id, p3._id] }).save();
    const studentRole = await new Role({ name: 'student', permissions: [] }).save();
    const parentRole = await new Role({ name: 'parent', permissions: [] }).save();
    console.log('Roles seeded.');

    // 3. Seed Users
    // Admin
    const adminUser = await new User({
      name: 'School Admin',
      email: 'admin@schoolerp.com',
      password: 'admin123',
      role: adminRole._id,
      phone: '+1 555-0100',
      profilePicture: 'http://localhost:5001/uploads/avatar.png'
    }).save();

    // Teachers
    const teacher1User = await new User({
      name: 'sachin patel',
      email: 'sachin@teacher.com',
      password: 'admin123',
      role: teacherRole._id,
      phone: '9876543210'
    }).save();

    const teacher2User = await new User({
      name: 'priya sharma',
      email: 'priya@teacher.com',
      password: 'admin123',
      role: teacherRole._id,
      phone: '9876543211'
    }).save();

    // Student
    const studentUser = await new User({
      name: 'daksh soni',
      email: 'dakshsoni1023@gmail.com',
      password: 'admin123',
      role: studentRole._id,
      phone: '8799288538',
      address: '205 nisarg hostel'
    }).save();

    // Parent
    const parentUser = await new User({
      name: 'rakeshbhai soni',
      email: 'rakesh0511@gmail.com',
      password: 'admin123',
      role: parentRole._id,
      phone: '9825750781',
      address: '205 nisarg hostel'
    }).save();
    console.log('Users seeded.');

    // 4. Seed Subjects
    const subMath = await new Subject({ name: 'Mathematics', code: 'MATH101' }).save();
    const subSci = await new Subject({ name: 'Science', code: 'SCI101' }).save();
    const subEng = await new Subject({ name: 'English', code: 'ENG101' }).save();
    const subSST = await new Subject({ name: 'Social Studies', code: 'SST101' }).save();
    console.log('Subjects seeded.');

    // 5. Seed Classes (Grade 1 to 10)
    console.log('Seeding Classes Grade 1 to Grade 10...');
    const classes = [];
    for (let i = 1; i <= 10; i++) {
      const clsName = `Grade ${i}`;
      // For Grade 1, we set classTeacher to sachin patel and assign subjects
      const isGrade1 = i === 1;
      const classDoc = new Class({
        name: clsName,
        sections: ['A', 'B', 'C'],
        classTeacher: isGrade1 ? teacher1User._id : undefined,
        sectionTeachers: isGrade1 ? [
          { section: 'A', teacher: teacher1User._id },
          { section: 'B', teacher: teacher2User._id }
        ] : [],
        subjects: isGrade1 ? [
          { subject: subMath._id, teacher: teacher1User._id },
          { subject: subSci._id, teacher: teacher1User._id },
          { subject: subEng._id, teacher: teacher2User._id },
          { subject: subSST._id, teacher: teacher2User._id }
        ] : []
      });
      await classDoc.save();
      classes.push(classDoc);
    }
    console.log('Classes Grade 1 to Grade 10 seeded.');

    const grade1Class = classes[0];

    // 6. Seed Student Details
    const studentDoc = await new Student({
      user: studentUser._id,
      name: studentUser.name,
      rollNumber: '1',
      classId: grade1Class._id,
      section: 'A',
      parentEmail: parentUser.email,
      parentName: parentUser.name,
      parentPhone: parentUser.phone,
      address: studentUser.address,
      bloodGroup: 'A+',
      aadhaarNumber: '123456789012'
    }).save();
    console.log('Student details seeded.');

    // 7. Seed Teacher Details
    const teacher1Doc = await new Teacher({
      user: teacher1User._id,
      name: teacher1User.name,
      qualification: 'Master of Sciences',
      subjects: [subMath._id, subSci._id],
      salary: 50000,
      designation: 'Senior Faculty',
      address: 'Staff Quarter 1',
      gender: 'Male',
      bloodGroup: 'B+'
    }).save();

    const teacher2Doc = await new Teacher({
      user: teacher2User._id,
      name: teacher2User.name,
      qualification: 'Master of Arts (English)',
      subjects: [subEng._id, subSST._id],
      salary: 45000,
      designation: 'Assistant Teacher',
      address: 'Staff Quarter 2',
      gender: 'Female',
      bloodGroup: 'A+'
    }).save();
    console.log('Teacher details seeded.');

    // 8. Seed Homework
    await new Homework({
      title: 'Algebra Exercise 1.2',
      description: 'Complete questions 1 to 10 in your Mathematics notebooks.',
      classId: grade1Class._id,
      section: 'A',
      subjectId: subMath._id,
      teacherId: teacher1User._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }).save();

    await new Homework({
      title: 'Photosynthesis Diagram',
      description: 'Draw and label the process of photosynthesis on a chart paper.',
      classId: grade1Class._id,
      section: 'A',
      subjectId: subSci._id,
      teacherId: teacher1User._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }).save();
    console.log('Homework seeded.');

    // 9. Seed Attendance
    console.log('Seeding student attendance logs...');
    for (let d = 0; d < 10; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const statuses = ['Present', 'Present', 'Present', 'Late', 'Present', 'Absent', 'Present', 'Present', 'Late', 'Present'];
      await new Attendance({
        student: studentUser._id,
        classId: grade1Class._id,
        section: 'A',
        date,
        status: statuses[d],
        markedBy: teacher1User._id
      }).save();
    }
    console.log('Attendance logs seeded.');

    // 10. Seed Exams
    const examMidterm = await new Exam({
      name: 'Midterm Exam',
      classId: grade1Class._id,
      term: 'Term 1',
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }).save();

    const examUnitTest = await new Exam({
      name: 'Unit Test 1',
      classId: grade1Class._id,
      term: 'Term 1',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // completed
    }).save();
    console.log('Exams seeded.');

    // 11. Seed Results
    await new Result({
      student: studentUser._id,
      classId: grade1Class._id,
      subjectId: subMath._id,
      examId: examUnitTest._id,
      examName: examUnitTest.name,
      marksObtained: 85,
      maxMarks: 100,
      remarks: 'Excellent algebraic skills.',
      gradedBy: teacher1User._id
    }).save();

    await new Result({
      student: studentUser._id,
      classId: grade1Class._id,
      subjectId: subSci._id,
      examId: examUnitTest._id,
      examName: examUnitTest.name,
      marksObtained: 72,
      maxMarks: 100,
      remarks: 'Good efforts. Review chemical equations.',
      gradedBy: teacher1User._id
    }).save();

    await new Result({
      student: studentUser._id,
      classId: grade1Class._id,
      subjectId: subEng._id,
      examId: examUnitTest._id,
      examName: examUnitTest.name,
      marksObtained: 91,
      maxMarks: 100,
      remarks: 'Flawless essay writing structure.',
      gradedBy: teacher2User._id
    }).save();
    console.log('Results seeded.');

    // 12. Seed Notices
    await new Notice({
      title: 'School Reopens after Summer Vacation',
      content: 'Classes will resume regular schedules starting from tomorrow morning at 8:00 AM. Please bring standard textbooks.',
      targetAudience: 'All',
      createdBy: adminUser._id
    }).save();

    await new Notice({
      title: 'Parent-Teacher Meeting next Saturday',
      content: 'All parents are requested to visit the school auditorium between 9:00 AM and 1:00 PM to collect unit test result sheets.',
      targetAudience: 'Parents',
      createdBy: adminUser._id
    }).save();

    await new Notice({
      title: 'Teacher Curriculum Syllabus Planning',
      content: 'Faculty meeting scheduled in the staffroom at 3:00 PM to draft lesson milestones for the upcoming term.',
      targetAudience: 'Teachers',
      createdBy: adminUser._id
    }).save();
    console.log('Notices seeded.');

    // 13. Seed Fees
    await new Fee({
      student: studentUser._id,
      title: 'Tuition Fee',
      amount: 1500,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'Partially Paid',
      amountPaid: 500
    }).save();

    await new Fee({
      student: studentUser._id,
      title: 'Library Fee',
      amount: 200,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'Paid',
      amountPaid: 200
    }).save();

    await new Fee({
      student: studentUser._id,
      title: 'Bus Transport Fee',
      amount: 600,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'Unpaid',
      amountPaid: 0
    }).save();
    console.log('Fees seeded.');

    console.log('15-Collection database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
