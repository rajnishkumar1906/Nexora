// games/game.routes.js
import express from 'express';
import { 
  inviteToGame, 
  joinGame, 
  getGameSession 
} from './game.controller.js';
import { protect } from '../middleware/middleware.js';

const router = express.Router();

// Apply protection to all game routes
router.use(protect);

router.post('/invite/:friendId', inviteToGame);
router.post('/join/:sessionId', joinGame);
router.get('/:sessionId', getGameSession);

export default router;
