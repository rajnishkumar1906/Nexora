// Global Socket Setup
import jwt from 'jsonwebtoken';
import User from '../auth/user.model.js';
import ServerMember from '../servers/server-member.model.js';
import { setupChatSocket } from './chat.socket.js';
import { setupChannelSocket } from './channel.socket.js';
import { setupServerSocket } from './server.socket.js';
import { setupGameSocket } from './game.socket.js';
import { setupCallSocket } from './call.socket.js';

export const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
      
      if (!token || token === 'undefined' || token === 'null') {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('username profile.displayName profile.avatar');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    await User.findByIdAndUpdate(userId, { 'profile.status': 'online' });
    
    socket.join(userId);

    const memberships = await ServerMember.find({ user: userId });
    memberships.forEach(m => {
      if (m.server) {
        const serverId = m.server.toString();
        socket.join(serverId);
        socket.to(serverId).emit('server_user_status', {
          userId,
          status: 'online'
        });
      }
    });

    socket.broadcast.emit('user_status_change', {
      userId,
      status: 'online'
    });

    setupChatSocket(io, socket);
    setupChannelSocket(io, socket);
    setupServerSocket(io, socket);
    setupGameSocket(io, socket);
    setupCallSocket(io, socket);

    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.username} (${socket.id})`);
      
      await User.findByIdAndUpdate(userId, { 
        'profile.status': 'offline',
        'profile.lastSeen': Date.now()
      });
      
      memberships.forEach(m => {
        if (m.server) {
          socket.to(m.server.toString()).emit('server_user_status', {
            userId,
            status: 'offline'
          });
        }
      });

      socket.broadcast.emit('user_status_change', {
        userId,
        status: 'offline'
      });
    });
  });
};
