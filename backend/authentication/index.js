import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

router.use('/', authRoutes);

export default {
  router,
  name: 'authentication-service',
  version: '1.0.0',
};
