import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Teacher from '../src/models/Teacher.js';
import Student from '../src/models/Student.js';
import Fee from '../src/models/Fee.js';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const emails = ['ramesh.kumar@schoolerp.com', 'suresh.patel@schoolerp.com'];

  for (const email of emails) {
    try {
      console.log(`\nProcessing cleanup for: ${email}`);
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`User not found for email: ${email}`);
        continue;
      }

      console.log(`Found User: ${user.name} (${user._id})`);
      
      // Let's delete references
      const studentDel = await Student.deleteMany({ user: user._id });
      console.log('Student details deleted:', studentDel);

      const teacherDel = await Teacher.deleteMany({ user: user._id });
      console.log('Teacher details deleted:', teacherDel);

      const feeDel = await Fee.deleteMany({ student: user._id });
      console.log('Fee invoices deleted:', feeDel);

      const userDel = await User.findByIdAndDelete(user._id);
      console.log('User deleted:', userDel ? 'Success' : 'Failed');
    } catch (err) {
      console.error(`Error deleting ${email}:`, err.stack);
    }
  }

  await mongoose.disconnect();
  console.log('\nCleanup finished.');
}

cleanup();
