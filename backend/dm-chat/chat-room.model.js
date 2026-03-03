import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, unique: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: { type: String, required: true },
      seen: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true },
);

export default mongoose.model('ChatRoom', chatRoomSchema);
