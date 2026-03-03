import mongoose from 'mongoose';

const serverMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    server: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Server',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
  },
  { timestamps: true },
);

serverMemberSchema.index({ user: 1, server: 1 }, { unique: true });

export default mongoose.model('ServerMember', serverMemberSchema);
