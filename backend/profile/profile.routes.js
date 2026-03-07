import express from 'express';
import { 
  getProfileByUsername, 
  getMyProfile, 
  updateProfile, 
  uploadAvatar, 
  uploadCoverImage, 
  deleteAvatar, 
  deleteCoverImage, 
  searchUsers 
} from './profile.controller.js';
import { protect } from '../middleware/middleware.js';
import { uploadMemory } from '../middleware/upload.js';
import { profileValidator } from '../utils/validators.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.get('/search', searchUsers);
router.get('/:username', getProfileByUsername);
router.put('/', protect, profileValidator, updateProfile);
router.post('/avatar', protect, uploadMemory.single('avatar'), uploadAvatar);
router.post('/cover', protect, uploadMemory.single('cover'), uploadCoverImage);
router.delete('/avatar', protect, deleteAvatar);
router.delete('/cover', protect, deleteCoverImage);

export default router;