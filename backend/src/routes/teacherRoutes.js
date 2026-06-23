import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  createTeacher,
  getTeachers,
  deleteTeacher,
  updateTeacher,
  getAssignedClasses,
  getStudentsByClass,
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  getSalaryDetails,
  deleteLeave
} from '../controllers/teacherController.js';
import {
  markAttendance,
  getAttendanceRecord
} from '../controllers/attendanceController.js';
import {
  addOrUpdateGrade,
  getGradesByClass
} from '../controllers/resultController.js';

const router = express.Router();

// Admin operations
router.post('/admin', protect, authorize('admin'), createTeacher);
router.get('/admin', protect, authorize('admin'), getTeachers);
router.put('/admin/:id', protect, authorize('admin'), updateTeacher);
router.delete('/admin/:id', protect, authorize('admin'), deleteTeacher);
router.get('/leaves/admin', protect, authorize('admin'), getAllLeaves);
router.put('/leaves/admin/:id', protect, authorize('admin'), reviewLeave);
router.delete('/leaves/admin/:id', protect, authorize('admin'), deleteLeave);

// Teacher operations
router.get('/classes', protect, authorize('teacher', 'admin'), getAssignedClasses);
router.get('/classes/:classId/students', protect, authorize('teacher', 'admin'), getStudentsByClass);
router.post('/leaves', protect, authorize('teacher'), applyLeave);
router.get('/leaves', protect, authorize('teacher'), getMyLeaves);
router.get('/salary', protect, authorize('teacher'), getSalaryDetails);

// Attendance operations
router.post('/attendance', protect, authorize('teacher', 'admin'), markAttendance);
router.get('/classes/:classId/attendance', protect, authorize('teacher', 'admin'), getAttendanceRecord);

// Grade operations
router.post('/grades', protect, authorize('teacher', 'admin'), addOrUpdateGrade);
router.get('/classes/:classId/grades', protect, authorize('teacher', 'admin'), getGradesByClass);

export default router;
