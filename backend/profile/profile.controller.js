// profile/profile.controller.js
import User from '../auth/user.model.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// ========== HELPER FUNCTIONS ==========

// Upload to Cloudinary from buffer
const uploadToCloudinary = (buffer, folder, publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `nexora/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto',
        transformation: [
          { width: 1000, crop: 'limit' }, // Limit max size
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

// ========== PROFILE CONTROLLERS ==========

// @desc    Get user profile by username
// @route   GET /api/profile/:username
// @access  Public
export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('-refreshToken -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If profile is viewed by the owner, return full profile
    // Otherwise return public profile
    const isOwner = req.user && req.user._id.toString() === user._id.toString();

    // Fix broken Cloudinary URLs for existing users
    if (user.profile.avatar === 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png') {
      user.profile.avatar = `https://ui-avatars.com/api/?name=${user.username}&background=8b5cf6&color=fff`;
    }
    if (user.profile.coverImage === 'https://res.cloudinary.com/demo/image/upload/v1/default-cover.jpg') {
      user.profile.coverImage = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';
    }

    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        username: user.username,
        email: isOwner ? user.email : undefined,
        profile: user.profile,
        stats: user.stats,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        isOwner
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-refreshToken -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fix broken Cloudinary URLs for existing users
    if (user.profile.avatar === 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png') {
      user.profile.avatar = `https://ui-avatars.com/api/?name=${user.username}&background=8b5cf6&color=fff`;
    }
    if (user.profile.coverImage === 'https://res.cloudinary.com/demo/image/upload/v1/default-cover.jpg') {
      user.profile.coverImage = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';
    }

    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        isOwner: true
      }
    });

  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, location, website } = req.body;

    // Build update object
    const updateData = {};
    if (displayName) updateData['profile.displayName'] = displayName;
    if (bio !== undefined) updateData['profile.bio'] = bio;
    if (location !== undefined) updateData['profile.location'] = location;
    if (website !== undefined) updateData['profile.website'] = website;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-refreshToken -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -loginAttempts -lockUntil');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if exists
    if (user.profile.avatarPublicId) {
      await deleteFromCloudinary(user.profile.avatarPublicId);
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'avatars',
      `avatar-${user._id}`
    );

    // Update user with new avatar URL
    user.profile.avatar = result.secure_url;
    user.profile.avatarPublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: result.secure_url
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
};

// @desc    Upload cover image
// @route   POST /api/profile/cover
// @access  Private
export const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old cover from Cloudinary if exists
    if (user.profile.coverImagePublicId) {
      await deleteFromCloudinary(user.profile.coverImagePublicId);
    }

    // Upload new cover to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'covers',
      `cover-${user._id}`
    );

    // Update user with new cover URL
    user.profile.coverImage = result.secure_url;
    user.profile.coverImagePublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cover image uploaded successfully',
      coverImage: result.secure_url
    });

  } catch (error) {
    console.error('Upload cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload cover image'
    });
  }
};

// @desc    Delete avatar (revert to default)
// @route   DELETE /api/profile/avatar
// @access  Private
export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Delete from Cloudinary if not default
    if (user.profile.avatarPublicId) {
      await deleteFromCloudinary(user.profile.avatarPublicId);
    }

    // Reset to default avatar
    user.profile.avatar = process.env.DEFAULT_AVATAR;
    user.profile.avatarPublicId = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar removed',
      avatar: user.profile.avatar
    });

  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete avatar'
    });
  }
};

// @desc    Delete cover image (revert to default)
// @route   DELETE /api/profile/cover
// @access  Private
export const deleteCoverImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Delete from Cloudinary if not default
    if (user.profile.coverImagePublicId) {
      await deleteFromCloudinary(user.profile.coverImagePublicId);
    }

    // Reset to default cover
    user.profile.coverImage = process.env.DEFAULT_COVER;
    user.profile.coverImagePublicId = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cover image removed',
      coverImage: user.profile.coverImage
    });

  } catch (error) {
    console.error('Delete cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cover image'
    });
  }
};

// @desc    Search users by username or displayName
// @route   GET /api/profile/search?q=query
// @access  Public
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { 'profile.displayName': { $regex: q, $options: 'i' } }
      ]
    })
    .select('username profile.displayName profile.avatar profile.status')
    .limit(20);

    res.status(200).json({
      success: true,
      results: users,
      count: users.length
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};