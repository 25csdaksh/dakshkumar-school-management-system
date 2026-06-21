import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load all 15 models
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

dotenv.config();

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
    console.log('Attempting connection to local fallback MongoDB for seeding (mongodb://127.0.0.1:27017/school_erp)...');
    try {
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('MongoDB Connected to local fallback for Seeding...');
    } catch (localError) {
      console.error(`Local Fallback Database Connection Failed: ${localError.message}`);
      console.error('Please verify your network access or ensure your IP address is whitelisted in MongoDB Atlas.');
      process.exit(1);
    }
  }

  try {
    // Clear all collections
    await Permission.deleteMany({});
    await Role.deleteMany({});
    await Subject.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    await Fee.deleteMany({});
    await FeePayment.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    await Homework.deleteMany({});
    await Notice.deleteMany({});
    await Event.deleteMany({});
    await Book.deleteMany({});
    await Hostel.deleteMany({});
    await Inventory.deleteMany({});
    await ActivityLog.deleteMany({});
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

    // 3. Seed Admin account
    const adminUser = await new User({
      name: 'School Admin',
      email: 'admin@schoolerp.com',
      password: 'admin123',
      role: adminRole._id,
      phone: '+1 555-0100',
      profilePicture: 'http://localhost:5001/uploads/avatar.png'
    }).save();
    console.log('Admin account created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
