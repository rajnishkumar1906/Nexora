import express from 'express';
import friendRoutes from './friend.routes.js';

const router = express.Router();

router.use('/', friendRoutes);

export default {
  router,
  name: 'friends-service',
};
