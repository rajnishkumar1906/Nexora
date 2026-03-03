import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
} from './friend.controller.js';
import { authMiddleware } from '../authentication/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getFriends);
router.post('/request/:recipientId', sendFriendRequest);
router.post('/accept/:requestId', acceptFriendRequest);
router.post('/reject/:requestId', rejectFriendRequest);
router.delete('/:friendId', removeFriend);

export default router;
