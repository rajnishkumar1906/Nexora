// Friend Controller
import User from '../user-profile/user.model.js';
import FriendRequest from './friend-request.model.js';

export const sendFriendRequest = async (req, res) => {
  try {
    res.json({ message: 'Send friend request endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    res.json({ message: 'Accept friend request endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    res.json({ message: 'Reject friend request endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    res.json({ message: 'Get friends endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    res.json({ message: 'Remove friend endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
