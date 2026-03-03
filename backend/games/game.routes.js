import express from 'express';
import { startGame, joinGame, makeMove, getGameState } from './game.controller.js';
import { authMiddleware } from '../authentication/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/start/:channelId', startGame);
router.post('/join/:gameId', joinGame);
router.post('/move/:gameId', makeMove);
router.get('/:gameId', getGameState);

export default router;