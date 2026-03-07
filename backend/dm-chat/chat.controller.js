// DM Chat Logic
import ChatRoom from './chat-room.model.js';
import ChatMessage from './chat-message.model.js';
import { asyncHandler } from '../utils/helpers.js';

export const getDMInbox = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const rooms = await ChatRoom.find({
    participants: userId
  })
  .populate('participants', 'username profile.displayName profile.avatar profile.status')
  .populate({
    path: 'lastMessage',
    populate: {
      path: 'author',
      select: 'username profile.displayName'
    }
  })
  .sort({ lastActivity: -1 });

  res.status(200).json({
    success: true,
    rooms
  });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await ChatMessage.findById(messageId);

  if (!message) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }

  if (message.author.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await ChatMessage.findByIdAndDelete(messageId);

  const io = req.app.get('io');
  io.to(message.chatRoom.toString()).emit('dm_message_deleted', {
    roomId: message.chatRoom,
    messageId
  });

  res.status(200).json({
    success: true,
    message: 'Message deleted'
  });
});

export const clearChatHistory = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  const room = await ChatRoom.findById(roomId);
  if (!room || !room.participants.includes(userId)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  await ChatMessage.deleteMany({ chatRoom: roomId });

  room.lastMessage = null;
  await room.save();

  const io = req.app.get('io');
  io.to(roomId).emit('dm_history_cleared', { roomId });

  res.status(200).json({
    success: true,
    message: 'Chat history cleared'
  });
});

export const deleteChatRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  const room = await ChatRoom.findById(roomId);
  if (!room || !room.participants.includes(userId)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  await ChatMessage.deleteMany({ chatRoom: roomId });
  
  await ChatRoom.findByIdAndDelete(roomId);

  res.status(200).json({
    success: true,
    message: 'Chat room deleted'
  });
});
