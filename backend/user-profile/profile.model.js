import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    bio: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Profile = mongoose.model('Profile', profileSchema);
