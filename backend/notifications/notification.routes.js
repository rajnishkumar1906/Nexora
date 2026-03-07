// notifications/notification.routes.js
import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from './notification.controller.js';
import { protect } from '../middleware/middleware.js';

const router = express.Router();

// Apply protection to all notification routes
router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
