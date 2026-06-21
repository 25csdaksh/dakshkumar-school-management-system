import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  createAcademicYear,
  getAcademicYears,
  setActiveAcademicYear,
  updateAcademicYear,
  getTimetableByClass,
  createOrUpdateTimetable,
  saveBulkTimetable,
  promoteStudents,
  issueCertificate,
  getCertificates,
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getHomeworkList,
  createHomework,
  updateHomework,
  deleteHomework
} from '../controllers/academicController.js';

const router = express.Router();

// Academic Years
router.post('/years', protect, authorize('admin'), createAcademicYear);
router.get('/years', protect, getAcademicYears);
router.put('/years/:id', protect, authorize('admin'), updateAcademicYear);
router.put('/years/:id/active', protect, authorize('admin'), setActiveAcademicYear);

// Timetables
router.get('/timetable/:classId', protect, getTimetableByClass);
router.post('/timetable', protect, authorize('admin'), createOrUpdateTimetable);
router.post('/timetable/bulk', protect, authorize('admin'), saveBulkTimetable);

// Exams
router.get('/exams', protect, getExams);
router.post('/exams', protect, authorize('admin'), createExam);
router.put('/exams/:id', protect, authorize('admin'), updateExam);
router.delete('/exams/:id', protect, authorize('admin'), deleteExam);

// Homework Logs
router.get('/homework', protect, getHomeworkList);
router.post('/homework', protect, authorize('admin', 'teacher'), createHomework);
router.put('/homework/:id', protect, authorize('admin', 'teacher'), updateHomework);
router.delete('/homework/:id', protect, authorize('admin', 'teacher'), deleteHomework);

// Promotions
router.post('/promote', protect, authorize('admin'), promoteStudents);

// Certificates
router.post('/certificates/issue', protect, authorize('admin'), issueCertificate);
router.get('/certificates', protect, getCertificates);

export default router;
