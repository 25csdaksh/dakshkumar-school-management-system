import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import uploadSingle from '../middleware/uploadMiddleware.js';
import {
  loginUser,
  getMe,
  updateProfile,
  registerUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  requestOtp,
  verifyOtpLogin,
  toggleTwoFactor,
  getNotifications
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadSingle, updateProfile);
router.get('/notifications', protect, getNotifications);

// Security Upgrades
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtpLogin);
router.post('/toggle-2fa', protect, toggleTwoFactor);

export default router;
