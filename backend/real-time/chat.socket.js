// DM Chat Socket Handler
import mongoose from 'mongoose';
import ChatRoom from '../dm-chat/chat-room.model.js';
import ChatMessage from '../dm-chat/chat-message.model.js';
import FriendRequest from '../friends/friend-request.model.js';

export const setupChatSocket = (io, socket) => {
  socket.on('get_dm_room', async ({ friendId }) => {
    try {
      const userId = socket.user._id;

      const isFriend = await FriendRequest.findOne({
        status: 'accepted',
        $or: [
          { sender: userId, recipient: friendId },
          { sender: friendId, recipient: userId }
        ]
      });

      if (!isFriend) {
        return socket.emit('error', 'You can only chat with friends');
      }

      // Ensure deterministic order
      const a = userId.toString();
      const b = friendId.toString();
      const sorted = [a, b].sort();
      const participants = [new mongoose.Types.ObjectId(sorted[0]), new mongoose.Types.ObjectId(sorted[1])];

      let room = await ChatRoom.findOne(
        { 'participants.0': participants[0], 'participants.1': participants[1] }
      ).populate('participants', 'username profile.displayName profile.avatar profile.status');

      if (!room) {
        // Upsert to avoid race and respect unique pair index
        room = await ChatRoom.findOneAndUpdate(
          { 'participants.0': participants[0], 'participants.1': participants[1] },
          { $setOnInsert: { participants, lastActivity: Date.now() } },
          { new: true, upsert: true, returnDocument: 'after' }
        );
        await room.populate('participants', 'username profile.displayName profile.avatar profile.status');
      } else {
        // Sanity check: ensure participants are exactly the expected pair
        const currentIds = (room.participants || []).map(p => p._id.toString()).sort();
        const expectedIds = participants.map(p => p.toString()).sort();
        const mismatch = currentIds.length !== 2 ||
          currentIds[0] !== expectedIds[0] || currentIds[1] !== expectedIds[1];
        if (mismatch) {
          room.participants = participants;
          await room.save();
          await room.populate('participants', 'username profile.displayName profile.avatar profile.status');
        }
      }

      socket.join(room._id.toString());
      socket.emit('dm_room_ready', room);
    } catch (error) {
      console.error('Get DM room socket error:', error);
      socket.emit('error', 'Failed to access chat room');
    }
  });

  socket.on('fetch_dm_history', async ({ roomId, page = 1, limit = 50 }) => {
    try {
      const userId = socket.user._id;
      const room = await ChatRoom.findById(roomId);
      
      if (!room || !room.participants.includes(userId)) {
        return socket.emit('error', 'Access denied');
      }

      const skip = (page - 1) * limit;
      const messages = await ChatMessage.find({ chatRoom: roomId })
        .populate('author', 'username profile.displayName profile.avatar')
        .populate({
          path: 'replyTo',
          populate: { path: 'author', select: 'username profile.displayName' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await ChatMessage.countDocuments({ chatRoom: roomId });

      await ChatMessage.updateMany(
        { chatRoom: roomId, author: { $ne: userId }, isRead: false },
        { $set: { isRead: true }, $addToSet: { readBy: userId } }
      );

      socket.emit('dm_history', {
        roomId,
        messages: messages.reverse(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Fetch DM history socket error:', error);
      socket.emit('error', 'Failed to fetch message history');
    }
  });

  socket.on('join_chat_room', async (roomId) => {
    try {
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.participants.includes(socket.user._id)) {
        return socket.emit('error', 'Access denied to this chat room');
      }

      socket.join(roomId);
      console.log(`💬 Socket ${socket.id} joined chat room: ${roomId}`);
    } catch (error) {
      console.error('Join chat room error:', error);
      socket.emit('error', 'Failed to join chat room');
    }
  });

  socket.on('leave_chat_room', (roomId) => {
    socket.leave(roomId);
    console.log(`💬 Socket ${socket.id} left chat room: ${roomId}`);
  });

  socket.on('send_dm_message', async ({ roomId, content, attachments, replyToId }) => {
    try {
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.participants.includes(socket.user._id)) {
        return socket.emit('error', 'Access denied');
      }

      const message = await ChatMessage.create({
        chatRoom: roomId,
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

      room.lastMessage = message._id;
      room.lastActivity = Date.now();
      await room.save();

      io.to(roomId).emit('new_dm_message', message);

      room.participants.forEach(participantId => {
        if (participantId.toString() !== socket.user._id.toString()) {
          io.to(participantId.toString()).emit('new_dm_notification', {
            roomId,
            message: {
              id: message._id,
              content: message.content,
              author: socket.user.username
            }
          });
        }
      });

    } catch (error) {
      console.error('Send DM message error:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('typing_dm', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('typing_dm_change', {
      roomId,
      userId: socket.user._id,
      username: socket.user.username,
      isTyping
    });
  });
};
