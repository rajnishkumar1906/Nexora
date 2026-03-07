// servers/server.routes.js
import express from 'express';
import { 
  createServer, 
  getMyServers, 
  exploreServers,
  getServerById, 
  joinServer, 
  leaveServer, 
  updateServer, 
  deleteServer, 
  getServerMembers,
  kickMember,
  updateMemberRole 
} from './server.controller.js';
import { protect } from '../middleware/middleware.js';
import { uploadMemory } from '../middleware/upload.js';

const router = express.Router();

// Apply protection to all server routes
router.use(protect);

router.post('/', uploadMemory.single('icon'), createServer);
router.get('/my', getMyServers);
router.get('/explore', exploreServers);
router.get('/:id', getServerById);
router.post('/join/:inviteCode', joinServer);
router.delete('/:id/leave', leaveServer);
router.put('/:id', uploadMemory.single('icon'), updateServer);
router.delete('/:id', deleteServer);
router.get('/:id/members', getServerMembers);
router.delete('/:id/members/:userId', kickMember);
router.patch('/:id/members/:userId/role', updateMemberRole);

export default router;
