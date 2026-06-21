import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  createFeeInvoice,
  getFeeInvoices,
  recordFeePayment,
  createFeeCategory,
  getFeeCategories,
  deleteFeeCategory,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentReceipt,
  sendFeeReminder
} from '../controllers/feeController.js';

const router = express.Router();

// Category CRUD
router.post('/categories', protect, authorize('admin'), createFeeCategory);
router.get('/categories', protect, getFeeCategories);
router.delete('/categories/:id', protect, authorize('admin'), deleteFeeCategory);

// Invoices
router.post('/', protect, authorize('admin'), createFeeInvoice);
router.get('/', protect, authorize('admin'), getFeeInvoices);
router.put('/:id/pay', protect, authorize('admin', 'student', 'parent'), recordFeePayment);

// Payments & Receipts
router.post('/payments/order', protect, createRazorpayOrder);
router.post('/payments/verify', protect, verifyRazorpayPayment);
router.get('/payments/receipt/:id', protect, getPaymentReceipt);

// Reminders
router.post('/reminders/:id', protect, authorize('admin'), sendFeeReminder);

export default router;
