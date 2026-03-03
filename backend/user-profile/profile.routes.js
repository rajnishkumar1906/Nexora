import express from 'express';
import {
  getUserById,
  getProfileByUserId,
  getOwnProfile,
  updateProfile,
  updateStatus,
} from './profile.controller.js';
import { authMiddleware } from '../authentication/auth.middleware.js';

const router = express.Router();

router.get('/:userId', getUserById);
router.get('/:userId/profile', getProfileByUserId);
router.get('/profile/me', authMiddleware, getOwnProfile);
router.patch('/profile/update', authMiddleware, updateProfile);
router.patch('/status', authMiddleware, updateStatus);

export default router;
