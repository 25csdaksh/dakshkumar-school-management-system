import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  createAcademicYear,
  getAcademicYears,
  setActiveAcademicYear,
  getTimetableByClass,
  createOrUpdateTimetable,
  promoteStudents,
  issueCertificate,
  getCertificates
} from '../controllers/academicController.js';

const router = express.Router();

// Academic Years
router.post('/years', protect, authorize('admin'), createAcademicYear);
router.get('/years', protect, getAcademicYears);
router.put('/years/:id/active', protect, authorize('admin'), setActiveAcademicYear);

// Timetables
router.get('/timetable/:classId', protect, getTimetableByClass);
router.post('/timetable', protect, authorize('admin'), createOrUpdateTimetable);

// Promotions
router.post('/promote', protect, authorize('admin'), promoteStudents);

// Certificates
router.post('/certificates/issue', protect, authorize('admin'), issueCertificate);
router.get('/certificates', protect, getCertificates);

export default router;
