import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Class from '../src/models/Class.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const classes = await Class.find({});
    console.log('Existing Classes in DB:', classes.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err.message);
    process.exit(1);
  }
};
run();
