import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { analyzeReportCard, checkTimetableConflicts } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze-report', protect, analyzeReportCard);
router.post('/resolve-timetable', protect, checkTimetableConflicts);

export default router;
