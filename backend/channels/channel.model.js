// channels/channel.model.js
import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    lowercase: true,
    minlength: [2, 'Channel name must be at least 2 characters'],
    maxlength: [32, 'Channel name cannot exceed 32 characters'],
    match: [/^[a-z0-9-]+$/, 'Channel name can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure a channel name is unique within a server
channelSchema.index({ server: 1, name: 1 }, { unique: true });

// Index for ordering and filtering
channelSchema.index({ server: 1, type: 1, order: 1 });

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
