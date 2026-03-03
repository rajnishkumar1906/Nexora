import express from 'express';
import chatRoutes from './chat.routes.js';

const router = express.Router();

router.use('/', chatRoutes);

export default {
  router,
  name: 'dm-chat-service',
};
