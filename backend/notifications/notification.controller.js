// Notification Controller
import Notification from './notification.model.js';

export const getNotifications = async (req, res) => {
  try {
    res.json({ message: 'Get notifications endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    res.json({ message: 'Get unread count endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    res.json({ message: 'Mark as read endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    res.json({ message: 'Mark all as read endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    res.json({ message: 'Delete notification endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    res.json({ message: 'Delete all notifications endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal function to create notifications (used by other services)
export const createNotification = async (data) => {
  try {
    const { user, sender, type, title, message, data: metaData, actionUrl } = data;
    const notification = await Notification.create({
      user,
      sender,
      type,
      title,
      message,
      data: metaData || {},
      actionUrl: actionUrl || '',
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};
