// Server Socket Handler
import ServerMember from '../servers/server-member.model.js';
import Server from '../servers/server.model.js';

export const setupServerSocket = (io, socket) => {
  socket.on('join_server_updates', async (serverId) => {
    try {
      const membership = await ServerMember.findOne({
        server: serverId,
        user: socket.user._id
      });

      if (!membership) {
        return socket.emit('error', 'You are not a member of this server');
      }

      socket.join(serverId.toString());
      console.log(`🏘️ Socket ${socket.id} joined server room: ${serverId}`);
    } catch (error) {
      console.error('Join server updates error:', error);
      socket.emit('error', 'Failed to join server updates');
    }
  });

  socket.on('leave_server_updates', (serverId) => {
    socket.leave(serverId.toString());
    console.log(`🏘️ Socket ${socket.id} left server room: ${serverId}`);
  });

  socket.on('fetch_server_members', async (serverId) => {
    try {
      const membership = await ServerMember.findOne({
        server: serverId,
        user: socket.user._id
      });

      if (!membership) return socket.emit('error', 'Access denied');

      const members = await ServerMember.find({ server: serverId })
        .populate('user', 'username profile.displayName profile.avatar profile.status')
        .sort({ role: 1, joinedAt: 1 });

      socket.emit('server_members_list', { serverId, members });
    } catch (error) {
      console.error('Fetch server members socket error:', error);
    }
  });
};
