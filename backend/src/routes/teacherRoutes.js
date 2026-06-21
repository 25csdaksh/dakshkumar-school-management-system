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
  getSalaryDetails
} from '../controllers/teacherController.js';

const router = express.Router();

// Admin operations
router.post('/admin', protect, authorize('admin'), createTeacher);
router.get('/admin', protect, authorize('admin'), getTeachers);
router.put('/admin/:id', protect, authorize('admin'), updateTeacher);
router.delete('/admin/:id', protect, authorize('admin'), deleteTeacher);
router.get('/leaves/admin', protect, authorize('admin'), getAllLeaves);
router.put('/leaves/admin/:id', protect, authorize('admin'), reviewLeave);

// Teacher operations
router.get('/classes', protect, authorize('teacher', 'admin'), getAssignedClasses);
router.get('/classes/:classId/students', protect, authorize('teacher', 'admin'), getStudentsByClass);
router.post('/leaves', protect, authorize('teacher'), applyLeave);
router.get('/leaves', protect, authorize('teacher'), getMyLeaves);
router.get('/salary', protect, authorize('teacher'), getSalaryDetails);

export default router;
