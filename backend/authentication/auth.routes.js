import express from 'express';
import { signUp, login, logout, getMe } from './auth.controller.js';
import { authMiddleware } from './auth.middleware.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
