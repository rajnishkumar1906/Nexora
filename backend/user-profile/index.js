import express from 'express';
import profileRoutes from './profile.routes.js';

const router = express.Router();

router.use('/', profileRoutes);

export default {
  router,
  name: 'user-profile-service',
};
