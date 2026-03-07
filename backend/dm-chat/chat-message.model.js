// dm-chat/chat-message.model.js
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  // session or conversationId
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  // sender id
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  attachments: [{
    url: String,
    publicId: String,
    filename: String,
    fileType: String,
    fileSize: Number
  }],
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for chat message history
chatMessageSchema.index({ chatRoom: 1, createdAt: -1 });

// Text search for searching messages
chatMessageSchema.index({ content: 'text' });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
