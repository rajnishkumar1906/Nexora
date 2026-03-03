import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteCode: { type: String, required: true, unique: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Server', serverSchema);
