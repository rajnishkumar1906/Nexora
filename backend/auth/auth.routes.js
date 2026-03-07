// auth/auth.routes.js
import express from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  changePassword,
  updateAccount,
  deleteAccount 
} from './auth.controller.js';
import { protect } from '../middleware/middleware.js';
import { registerValidator, loginValidator } from '../utils/validators.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', protect, changePassword);
router.put('/account', protect, updateAccount);
router.delete('/account', protect, deleteAccount);

export default router;