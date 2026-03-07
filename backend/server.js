import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/db.js';
import authMiddleware from './middleware/middleware.js';
import authRoutes from './auth/auth.routes.js';
import profileRoutes from './profile/profile.routes.js';
import serverRoutes from './servers/server.routes.js';
import channelRoutes from './channels/channel.routes.js';
import friendRoutes from './friends/friend.routes.js';
import chatRoutes from './dm-chat/chat.routes.js';
import gameRoutes from './games/game.routes.js';
import notificationRoutes from './notifications/notification.routes.js';
import { globalSearch } from './utils/search.controller.js';
import { setupSocket } from './real-time/index.js';
import ChatRoom from './dm-chat/chat-room.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Security and Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:5175'];

const io = new SocketServer(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }
});

// Make io accessible to routes
app.set('io', io);

// Pass io to real-time service
setupSocket(io);

connectDB();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Fix incorrect unique index on chatrooms if present and ensure correct index
mongoose.connection.once('open', async () => {
  try {
    const indexes = await ChatRoom.collection.indexes();
    const hasBad = indexes.find(ix => ix.name === 'participants_1');
    if (hasBad) {
      console.log('🛠️ Dropping invalid unique index participants_1 on chatrooms...');
      await ChatRoom.collection.dropIndex('participants_1');
    }
    await ChatRoom.collection.createIndex({ 'participants.0': 1, 'participants.1': 1 }, { unique: true });
    console.log('✅ Ensured unique pair index on chatrooms');
  } catch (e) {
    console.log('Index maintenance info:', e.message);
  }
});

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(authMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/api/search', globalSearch);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Any route that is not an API route will be handled by the frontend
  app.get('*', (req, res) => {
    // Only handle routes that are not API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    }
  });
} else {
  // Root route for development
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Nexora API is running',
      version: '1.0.0'
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 http://localhost:${PORT}\n`);
});

export { app, io };
export default server;
