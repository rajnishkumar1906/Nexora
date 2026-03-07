// Channel Socket Handler
import Channel from '../channels/channel.model.js';
import ChannelMessage from '../channels/channel-message.model.js';
import ServerMember from '../servers/server-member.model.js';

export const setupChannelSocket = (io, socket) => {
  socket.on('join_channel', async (channelId) => {
    try {
      const channel = await Channel.findById(channelId).populate('server', 'name icon');
      if (!channel) {
        return socket.emit('error', 'Channel not found');
      }

      const membership = await ServerMember.findOne({
        server: channel.server._id,
        user: socket.user._id
      });

      if (!membership) {
        return socket.emit('error', 'You are not a member of this server');
      }

      socket.join(channelId.toString());
      console.log(`📡 Socket ${socket.id} joined channel: ${channelId}`);
      
      socket.emit('channel_ready', channel);
    } catch (error) {
      console.error('Join channel error:', error);
      socket.emit('error', 'Failed to join channel');
    }
  });

  socket.on('fetch_channel_history', async ({ channelId, page = 1, limit = 50 }) => {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) return socket.emit('error', 'Channel not found');

      const membership = await ServerMember.findOne({
        server: channel.server,
        user: socket.user._id
      });

      if (!membership) return socket.emit('error', 'Access denied');

      const skip = (page - 1) * limit;
      const messages = await ChannelMessage.find({ channel: channelId })
        .populate('author', 'username profile.displayName profile.avatar')
        .populate({
          path: 'replyTo',
          populate: { path: 'author', select: 'username profile.displayName' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await ChannelMessage.countDocuments({ channel: channelId });

      socket.emit('channel_history', {
        channelId,
        messages: messages.reverse(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Fetch channel history socket error:', error);
      socket.emit('error', 'Failed to fetch messages');
    }
  });

  socket.on('leave_channel', (channelId) => {
    socket.leave(channelId);
    console.log(`📡 Socket ${socket.id} left channel: ${channelId}`);
  });

  socket.on('send_channel_message', async ({ channelId, content, attachments, replyToId }) => {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return socket.emit('error', 'Channel not found');
      }

      const membership = await ServerMember.findOne({
        server: channel.server,
        user: socket.user._id
      });

      if (!membership) {
        return socket.emit('error', 'You are not a member of this server');
      }

      const message = await ChannelMessage.create({
        channel: channelId,
        server: channel.server,
        author: socket.user._id,
        content,
        attachments: attachments || [],
        replyTo: replyToId || null
      });

      await message.populate('author', 'username profile.displayName profile.avatar');
      if (replyToId) {
        await message.populate({
          path: 'replyTo',
          populate: { path: 'author', select: 'username profile.displayName' }
        });
      }

      io.to(channelId).emit('new_channel_message', message);

      io.to(channel.server.toString()).emit('new_channel_notification', {
        serverId: channel.server,
        channelId,
        message: {
          id: message._id,
          content: message.content,
          author: socket.user.username
        }
      });

    } catch (error) {
      console.error('Send channel message error:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('typing_channel', ({ channelId, isTyping }) => {
    socket.to(channelId).emit('typing_channel_change', {
      channelId,
      userId: socket.user._id,
      username: socket.user.username,
      isTyping
    });
  });

  socket.on('reaction_channel', async ({ messageId, emoji }) => {
    try {
      const message = await ChannelMessage.findById(messageId);
      if (!message) return;

      const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
      
      if (reactionIndex > -1) {
        const userIndex = message.reactions[reactionIndex].users.indexOf(socket.user._id);
        if (userIndex > -1) {
          message.reactions[reactionIndex].users.splice(userIndex, 1);
          if (message.reactions[reactionIndex].users.length === 0) {
            message.reactions.splice(reactionIndex, 1);
          }
        } else {
          message.reactions[reactionIndex].users.push(socket.user._id);
        }
      } else {
        message.reactions.push({ emoji, users: [socket.user._id] });
      }

      await message.save();
      if (message.channel) {
        io.to(message.channel.toString()).emit('reaction_change', {
          messageId,
          reactions: message.reactions
        });
      }
    } catch (error) {
      console.error('Reaction error:', error);
    }
  });
};
