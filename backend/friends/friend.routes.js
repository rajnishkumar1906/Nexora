// friends/friend.routes.js
import express from 'express';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  getFriends, 
  getPendingRequests, 
  removeFriend 
} from './friend.controller.js';
import { protect } from '../middleware/middleware.js';

const router = express.Router();

// Apply protection to all friend routes
router.use(protect);

router.post('/request/:recipientId', sendFriendRequest);
router.post('/accept/:requestId', acceptFriendRequest);
router.post('/reject/:requestId', rejectFriendRequest);
router.get('/', getFriends);
router.get('/requests', getPendingRequests);
router.delete('/:friendId', removeFriend);

export default router;
