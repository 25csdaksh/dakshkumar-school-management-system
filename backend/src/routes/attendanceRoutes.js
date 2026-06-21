import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  markAttendance,
  getAttendanceRecord,
  logBiometricAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/', protect, authorize('teacher', 'admin'), markAttendance);
router.get('/classes/:classId', protect, authorize('teacher', 'admin'), getAttendanceRecord);
router.post('/biometric', logBiometricAttendance);

export default router;
