// Auth Logic
import User from './user.model.js';
import ServerMember from '../servers/server-member.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

const isAccountLocked = (user) => {
  return !!(user.lockUntil && user.lockUntil > Date.now());
};

const incrementLoginAttempts = async (user) => {
  if (user.lockUntil && user.lockUntil < Date.now()) {
    user.loginAttempts = 1;
    user.lockUntil = undefined;
    return await user.save();
  }
  
  user.loginAttempts += 1;
  
  if (user.loginAttempts >= 5 && !isAccountLocked(user)) {
    user.lockUntil = Date.now() + 3600000;
  }
  
  return await user.save();
};

const resetLoginAttempts = async (user) => {
  if (user.loginAttempts > 0 || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    return await user.save();
  }
  return user;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

const setTokenCookie = (res, token, refreshToken) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      'profile.displayName': username
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookie(res, token, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (isAccountLocked(user)) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${lockTimeRemaining} minutes.`
      });
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      await incrementLoginAttempts(user);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await resetLoginAttempts(user);

    user.profile.status = 'online';
    user.profile.lastSeen = Date.now();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookie(res, token, refreshToken);

    user.password = undefined;
    user.refreshToken = undefined;
    user.loginAttempts = undefined;
    user.lockUntil = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
        'profile.status': 'offline',
        'profile.lastSeen': Date.now()
      });
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookie(res, newToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profile: req.user.profile,
        role: req.user.role,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.passwordResetExpires = Date.now() + 3600000;

    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordMatch = await comparePassword(currentPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.refreshToken = undefined;

    await user.save();

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ success: false, message: 'Username already taken' });
      user.username = username;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
      user.email = email;
      user.isVerified = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ success: false, message: 'Failed to update account' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await ServerMember.deleteMany({ user: userId });
    
    await User.findByIdAndUpdate(userId, { 
      isActive: false,
      'profile.status': 'offline',
      refreshToken: undefined
    });

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
};
