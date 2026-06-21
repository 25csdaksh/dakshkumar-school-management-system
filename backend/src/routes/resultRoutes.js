import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  addOrUpdateGrade,
  getGradesByClass
} from '../controllers/resultController.js';

const router = express.Router();

router.post('/', protect, authorize('teacher', 'admin'), addOrUpdateGrade);
router.get('/classes/:classId', protect, authorize('teacher', 'admin'), getGradesByClass);

export default router;
