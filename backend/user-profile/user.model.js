import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
    lastSeen: { type: Date, default: Date.now },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    servers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Server' }],
    avatar: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);

