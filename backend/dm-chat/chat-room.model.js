// dm-chat/chat-room.model.js
import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  // array of participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure array order is deterministic so compound index works
chatRoomSchema.pre('save', function() {
  if (Array.isArray(this.participants) && this.participants.length > 0) {
    this.participants = this.participants
      .map(id => id.toString())
      .sort()
      .map(id => new mongoose.Types.ObjectId(id));
  }
});

// Unique pair constraint (order-insensitive). Requires sorted participants.
chatRoomSchema.index({ 'participants.0': 1, 'participants.1': 1 }, { unique: true });

// Index for common queries
chatRoomSchema.index({ participants: 1, lastActivity: -1 });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;
