// Friend Logic
import mongoose from 'mongoose';
import FriendRequest from './friend-request.model.js';
import User from '../auth/user.model.js';
import { createAndEmitNotification } from '../notifications/notification.controller.js';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user._id;

    // Validate recipient ID format
    if (!recipientId || !isValidObjectId(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Check if sending to self
    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId).select('_id username');
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for existing request/friendship
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    });

    if (existingRequest) {
      switch (existingRequest.status) {
        case 'accepted':
          return res.status(400).json({
            success: false,
            message: 'You are already friends with this user'
          });
        
        case 'pending':
          const isSender = existingRequest.sender.toString() === senderId.toString();
          return res.status(400).json({
            success: false,
            message: isSender 
              ? 'Friend request already sent' 
              : 'You have a pending friend request from this user'
          });
        
        case 'rejected':
          // Check if rejected request is older than 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          if (existingRequest.updatedAt < sevenDaysAgo) {
            // Override old rejected request
            existingRequest.status = 'pending';
            existingRequest.sender = senderId;
            existingRequest.recipient = recipientId;
            await existingRequest.save();
          } else {
            return res.status(400).json({
              success: false,
              message: 'Cannot send request - previous request was recently rejected'
            });
          }
          break;
        
        case 'blocked':
          if (existingRequest.blockedBy?.toString() === recipientId.toString()) {
            return res.status(403).json({
              success: false,
              message: 'You cannot send a friend request to this user'
            });
          }
          break;
        
        default:
          // Override any other status
          existingRequest.status = 'pending';
          existingRequest.sender = senderId;
          existingRequest.recipient = recipientId;
          await existingRequest.save();
      }
    } else {
      // Create new friend request
      await FriendRequest.create({
        sender: senderId,
        recipient: recipientId,
        status: 'pending'
      });
    }

    // Send notification
    try {
      await createAndEmitNotification(req.app, {
        recipient: recipientId,
        sender: senderId,
        type: 'friend_request',
        content: `${req.user.username} sent you a friend request`,
        extraData: { 
          senderId: senderId.toString(),
          senderUsername: req.user.username,
          senderAvatar: req.user.profile?.avatar
        }
      });
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request. Please try again.'
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const recipientId = req.user._id;

    // Validate request ID
    if (!requestId || !isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }

    // Find and populate the request
    const request = await FriendRequest.findById(requestId)
      .populate('sender', 'username profile.displayName profile.avatar');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Verify that the current user is the recipient
    if (request.recipient.toString() !== recipientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this request'
      });
    }

    // Check if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request is ${request.status} and cannot be accepted`
      });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Update friend counts for both users
    await Promise.all([
      User.findByIdAndUpdate(request.sender._id, { $inc: { 'stats.friends': 1 } }),
      User.findByIdAndUpdate(request.recipient, { $inc: { 'stats.friends': 1 } })
    ]);

    // Send notification
    try {
      await createAndEmitNotification(req.app, {
        recipient: request.sender._id,
        sender: recipientId,
        type: 'friend_accept',
        content: `${req.user.username} accepted your friend request`,
        extraData: { 
          recipientId: recipientId.toString(),
          recipientUsername: req.user.username,
          recipientAvatar: req.user.profile?.avatar
        }
      });
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Friend request accepted',
      data: {
        friend: {
          _id: request.sender._id,
          username: request.sender.username,
          profile: request.sender.profile
        }
      }
    });

  } catch (error) {
    console.error('Accept friend request error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to accept friend request'
    });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const recipientId = req.user._id;

    // Validate request ID
    if (!requestId || !isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Verify that the current user is the recipient
    if (request.recipient.toString() !== recipientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this request'
      });
    }

    // Update request status
    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Friend request rejected'
    });

  } catch (error) {
    console.error('Reject friend request error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to reject friend request'
    });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {
      status: 'accepted',
      $or: [{ sender: userId }, { recipient: userId }]
    };

    // Find all accepted friendships
    const friendships = await FriendRequest.find(query)
      .populate({
        path: 'sender',
        select: 'username profile.displayName profile.avatar profile.status profile.lastSeen',
        match: { _id: { $ne: userId } }
      })
      .populate({
        path: 'recipient',
        select: 'username profile.displayName profile.avatar profile.status profile.lastSeen',
        match: { _id: { $ne: userId } }
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await FriendRequest.countDocuments(query);

    // Process friends list
    let friendsList = friendships
      .map(f => {
        const friend = f.sender || f.recipient;
        if (!friend) return null;
        
        const friendObj = friend.toObject();
        
        // Handle default avatar if needed
        if (!friendObj.profile?.avatar || friendObj.profile?.avatar.includes('res.cloudinary.com/demo/')) {
          friendObj.profile = friendObj.profile || {};
          friendObj.profile.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(friendObj.username)}&background=8b5cf6&color=fff&bold=true`;
        }
        
        return friendObj;
      })
      .filter(f => f !== null); // Remove null values

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      friendsList = friendsList.filter(f => 
        f.username.toLowerCase().includes(searchLower) ||
        f.profile?.displayName?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      friends: friendsList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friends list'
    });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get incoming requests
    const incoming = await FriendRequest.find({
      recipient: userId,
      status: 'pending'
    })
      .populate('sender', 'username profile.displayName profile.avatar profile.status')
      .sort({ createdAt: -1 });

    // Get outgoing requests
    const outgoing = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    })
      .populate('recipient', 'username profile.displayName profile.avatar profile.status')
      .sort({ createdAt: -1 });

    // Process avatars for incoming requests
    const processedIncoming = incoming.map(req => {
      const reqObj = req.toObject();
      if (!reqObj.sender?.profile?.avatar) {
        if (reqObj.sender) {
          reqObj.sender.profile = reqObj.sender.profile || {};
          reqObj.sender.profile.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(reqObj.sender.username)}&background=8b5cf6&color=fff&bold=true`;
        }
      }
      return reqObj;
    });

    // Process avatars for outgoing requests
    const processedOutgoing = outgoing.map(req => {
      const reqObj = req.toObject();
      if (!reqObj.recipient?.profile?.avatar) {
        if (reqObj.recipient) {
          reqObj.recipient.profile = reqObj.recipient.profile || {};
          reqObj.recipient.profile.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(reqObj.recipient.username)}&background=8b5cf6&color=fff&bold=true`;
        }
      }
      return reqObj;
    });

    res.status(200).json({
      success: true,
      incoming: processedIncoming,
      outgoing: processedOutgoing,
      counts: {
        incoming: processedIncoming.length,
        outgoing: processedOutgoing.length
      }
    });

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending requests'
    });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // Validate friend ID
    if (!friendId || !isValidObjectId(friendId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid friend ID format'
      });
    }

    // Find the friendship
    const friendship = await FriendRequest.findOne({
      status: 'accepted',
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friendship not found'
      });
    }

    // Delete the friendship
    await FriendRequest.findByIdAndDelete(friendship._id);

    // Update friend counts
    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { 'stats.friends': -1 } }),
      User.findByIdAndUpdate(friendId, { $inc: { 'stats.friends': -1 } })
    ]);

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });

  } catch (error) {
    console.error('Remove friend error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid friend ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to remove friend'
    });
  }
};

// Optional: Get friend status with another user
export const getFriendStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const friendship = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    });

    let status = 'none';
    let requestId = null;

    if (friendship) {
      if (friendship.status === 'accepted') {
        status = 'friends';
      } else if (friendship.status === 'pending') {
        // Check if current user is sender or recipient
        const isSender = friendship.sender.toString() === currentUserId.toString();
        status = isSender ? 'request_sent' : 'request_received';
        requestId = friendship._id;
      } else {
        status = friendship.status;
      }
    }

    res.status(200).json({
      success: true,
      status,
      requestId,
      friendship: friendship ? {
        _id: friendship._id,
        status: friendship.status,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt
      } : null
    });

  } catch (error) {
    console.error('Get friend status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friend status'
    });
  }
};