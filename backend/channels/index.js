import express from 'express';
import channelRoutes from './channel.routes.js';

const router = express.Router();

router.use('/', channelRoutes);

export default {
  router,
  name: 'channels-service',
};
