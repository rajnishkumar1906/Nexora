import express from 'express';
import serverRoutes from './server.routes.js';

const router = express.Router();

router.use('/', serverRoutes);

export default {
  router,
  name: 'servers-service',
};
