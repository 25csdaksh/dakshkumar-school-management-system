import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  createStudent,
  getStudents,
  deleteStudent,
  updateStudent,
  getStudentDashboard,
  getStudentAttendance,
  getStudentGrades,
  getStudentFees,
  getParentDashboard,
  getStudentHomework,
  importStudents
} from '../controllers/studentController.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Admin: register/retrieve/delete student
router.post('/admin', protect, authorize('admin'), createStudent);
router.post('/admin/import', protect, authorize('admin'), upload.single('file'), importStudents);
router.get('/admin', protect, authorize('admin'), getStudents);
router.put('/admin/:id', protect, authorize('admin'), updateStudent);
router.delete('/admin/:id', protect, authorize('admin'), deleteStudent);

// Student/Parent/Admin dashboard and info queries
router.get('/dashboard', protect, getStudentDashboard);
router.get('/attendance', protect, getStudentAttendance);
router.get('/grades', protect, getStudentGrades);
router.get('/fees', protect, getStudentFees);
router.get('/homework', protect, getStudentHomework);

// Parent kid linking
router.get('/parent/children', protect, authorize('parent'), getParentDashboard);

export default router;
