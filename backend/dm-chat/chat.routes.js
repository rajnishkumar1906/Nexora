import express from 'express';
import { getChatList, getChatMessages, sendMessage } from './chat.controller.js';
import { authMiddleware } from '../authentication/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/list', getChatList);
router.get('/:chatId', getChatMessages);
router.post('/send', sendMessage);

export default router;
