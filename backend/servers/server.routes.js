import express from 'express';
import {
  getMyServers,
  createServer,
  getServer,
  getServerByInviteCode,
  joinServer,
  leaveServer,
  updateServer,
  deleteServer,
  getServerMembers,
  updateMemberRole,
  discoverServers,
} from './server.controller.js';
import { authMiddleware } from '../authentication/auth.middleware.js';

const router = express.Router();

router.get('/invite/:code', getServerByInviteCode);

router.use(authMiddleware);
router.get('/', getMyServers);
router.get('/discover', discoverServers);
router.post('/', createServer);
router.get('/:serverId', getServer);
router.patch('/:serverId', updateServer);
router.delete('/:serverId', deleteServer);
router.get('/:serverId/members', getServerMembers);
router.patch('/:serverId/members/:memberId/role', updateMemberRole);
router.post('/join/:code', joinServer);
router.post('/:serverId/leave', leaveServer);

export default router;
