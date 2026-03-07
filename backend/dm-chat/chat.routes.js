// dm-chat/chat.routes.js
import express from 'express';
import { 
  getDMInbox, 
  deleteMessage, 
  clearChatHistory, 
  deleteChatRoom 
} from './chat.controller.js';
import { protect } from '../middleware/middleware.js';

const router = express.Router();

// Apply protection to all DM chat routes
router.use(protect);

// Management & Structural Routes
router.get('/rooms', getDMInbox);
router.delete('/messages/:messageId', deleteMessage);
router.delete('/room/:roomId/clear', clearChatHistory);
router.delete('/room/:roomId', deleteChatRoom);

export default router;
