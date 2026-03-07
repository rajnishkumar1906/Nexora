// auth/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    // unique: true removed from here - will be added in schema.index
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    // unique: true removed from here - will be added in schema.index
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profile: {
    displayName: {
      type: String,
      default: function() {
        return this.username;
      }
    },
    avatar: {
      type: String,
      default: process.env.DEFAULT_AVATAR || 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff'
    },
    avatarPublicId: {
      type: String,
      default: null
    },
    coverImage: {
      type: String,
      default: process.env.DEFAULT_COVER || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop'
    },
    coverImagePublicId: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: ''
    },
    website: {
      type: String,
      maxlength: [200, 'Website URL cannot exceed 200 characters'],
      default: '',
      match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please provide a valid URL']
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'dnd'],
      default: 'offline'
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  stats: {
    servers: {
      type: Number,
      default: 0
    },
    friends: {
      type: Number,
      default: 0
    },
    posts: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  refreshToken: {
    type: String,
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// ✅ Define ALL indexes here in one place
// Unique indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

// Text search index for searching users
userSchema.index({ 
  'profile.displayName': 'text',
  username: 'text' 
});

// Compound indexes for common queries
userSchema.index({ 'profile.status': 1, updatedAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ isVerified: 1 });

// Index for login attempts and lockout
userSchema.index({ loginAttempts: 1, lockUntil: 1 });

const User = mongoose.model('User', userSchema);

export default User;