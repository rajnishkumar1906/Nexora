// channels/channel.routes.js
import express from 'express';
import { 
  createChannel, 
  getServerChannels, 
  getChannelById, 
  updateChannel, 
  deleteChannel, 
  getChannelMessages 
} from './channel.controller.js';
import { protect } from '../middleware/middleware.js';

const router = express.Router();

// Apply protection to all channel routes
router.use(protect);

router.post('/', createChannel);
router.get('/server/:serverId', getServerChannels);
router.get('/:id', getChannelById);
router.put('/:id', updateChannel);
router.delete('/:id', deleteChannel);
router.get('/:id/messages', getChannelMessages);

export default router;
