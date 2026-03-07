// channels/channel-message.model.js
import mongoose from 'mongoose';

const channelMessageSchema = new mongoose.Schema({
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
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
    ref: 'ChannelMessage',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for channel message history
channelMessageSchema.index({ channel: 1, createdAt: -1 });
channelMessageSchema.index({ server: 1, createdAt: -1 });

// Text search for searching messages
channelMessageSchema.index({ content: 'text' });

const ChannelMessage = mongoose.model('ChannelMessage', channelMessageSchema);

export default ChannelMessage;
