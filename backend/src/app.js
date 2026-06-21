import express from 'express';
import cors from 'cors';
import path from 'path';

// Import Route modules
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Admin controller for stats, classes, and notices
import { protect } from './middleware/authMiddleware.js';
import { authorize } from './middleware/roleMiddleware.js';
import {
  getDashboardStats,
  createClass,
  getClasses,
  addSubjectToClass,
  updateClass,
  deleteClass,
  getSubjects,
  createNotice,
  getNotices,
  deleteNotice
} from './controllers/adminController.js';

import { createStudent, getStudents, deleteStudent, getParentDashboard } from './controllers/studentController.js';
import { createTeacher, getTeachers, deleteTeacher } from './controllers/teacherController.js';
import { getActivityLogs } from './controllers/authController.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve uploads
const uploadsPath = path.join(process.cwd(), 'public');
app.use('/uploads', express.static(path.join(uploadsPath, 'uploads')));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. AUTH ROUTES
// ==========================================
app.use('/api/auth', authRoutes);

// ==========================================
// 2. STUDENT & PARENT ROUTES
// ==========================================
app.use('/api/student', studentRoutes);
app.get('/api/parent/children', protect, authorize('parent'), getParentDashboard);

// ==========================================
// 3. TEACHER ROUTES
// ==========================================
app.use('/api/teacher', teacherRoutes);

// ==========================================
// 4. FEES BILLING & ACADEMIC ROUTES
// ==========================================
app.use('/api/admin/fees', feeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/ai', aiRoutes);

// ==========================================
// 5. ATTENDANCE & RESULTS INTERMEDIATES
// ==========================================
app.post('/api/teacher/attendance', protect, authorize('teacher', 'admin'), (req, res, next) => {
  // Pass to attendanceRoutes
  next();
}, attendanceRoutes);
app.get('/api/teacher/classes/:classId/attendance', protect, authorize('teacher', 'admin'), (req, res, next) => {
  // Pass to attendanceRoutes
  next();
}, attendanceRoutes);

app.post('/api/teacher/grades', protect, authorize('teacher', 'admin'), (req, res, next) => {
  // Pass to resultRoutes
  next();
}, resultRoutes);
app.get('/api/teacher/classes/:classId/grades', protect, authorize('teacher', 'admin'), (req, res, next) => {
  // Pass to resultRoutes
  next();
}, resultRoutes);

// ==========================================
// 6. ADMIN SYSTEM MANAGEMENT ROUTES
// ==========================================
app.get('/api/admin/stats', protect, authorize('admin'), getDashboardStats);
app.get('/api/admin/activity-logs', protect, authorize('admin'), getActivityLogs);

// User router splitter for Admin creation/retrievals/deletions
app.post('/api/admin/users', protect, authorize('admin'), (req, res) => {
  if (req.body.role === 'student') {
    return createStudent(req, res);
  } else if (req.body.role === 'teacher') {
    return createTeacher(req, res);
  }
  res.status(400).json({ message: 'Invalid role for user creation' });
});

app.get('/api/admin/users', protect, authorize('admin'), (req, res) => {
  const { role } = req.query;
  if (role === 'student') {
    return getStudents(req, res);
  } else if (role === 'teacher') {
    return getTeachers(req, res);
  }
  res.status(400).json({ message: 'Role parameter is required (student/teacher)' });
});

app.delete('/api/admin/users/:id', protect, authorize('admin'), async (req, res) => {
  // Inspect if student or teacher to delete appropriately
  try {
    const student = await Student.findOne({ user: req.params.id });
    if (student) {
      return deleteStudent(req, res);
    }
    const teacher = await Teacher.findOne({ user: req.params.id });
    if (teacher) {
      return deleteTeacher(req, res);
    }
    res.status(404).json({ message: 'User records not found in students or teachers' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Class routes
app.post('/api/admin/classes', protect, authorize('admin'), createClass);
app.get('/api/admin/classes', getClasses);
app.put('/api/admin/classes/:id', protect, authorize('admin'), updateClass);
app.delete('/api/admin/classes/:id', protect, authorize('admin'), deleteClass);
app.post('/api/admin/classes/:id/subjects', protect, authorize('admin'), addSubjectToClass);
app.get('/api/admin/subjects', protect, getSubjects);

// Admin Notice routes
app.post('/api/admin/notices', protect, authorize('admin'), createNotice);
app.get('/api/admin/notices', protect, authorize('admin'), getNotices);
app.delete('/api/admin/notices/:id', protect, authorize('admin'), deleteNotice);

// Health check
app.get('/', (req, res) => {
  res.send('School ERP API Server (src/app.js) is active...');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

export default app;
