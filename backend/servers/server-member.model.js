// servers/server-member.model.js
import mongoose from 'mongoose';

const serverMemberSchema = new mongoose.Schema({
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  },
  nickname: {
    type: String,
    maxlength: [32, 'Nickname cannot exceed 32 characters'],
    default: null
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a user can only be in a server once
serverMemberSchema.index({ server: 1, user: 1 }, { unique: true });

// Index for common queries
serverMemberSchema.index({ server: 1, role: 1 });
serverMemberSchema.index({ user: 1 });

const ServerMember = mongoose.model('ServerMember', serverMemberSchema);

export default ServerMember;
