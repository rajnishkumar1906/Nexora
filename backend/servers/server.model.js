// servers/server.model.js
import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Server name is required'],
    trim: true,
    minlength: [3, 'Server name must be at least 3 characters'],
    maxlength: [50, 'Server name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  icon: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=Server&background=10b981&color=fff&bold=true'
    },
  iconPublicId: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['gaming', 'music', 'education', 'science', 'entertainment', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Index for searching servers
serverSchema.index({ name: 'text', description: 'text' });
serverSchema.index({ owner: 1 });
serverSchema.index({ category: 1 });

const Server = mongoose.model('Server', serverSchema);

export default Server;
