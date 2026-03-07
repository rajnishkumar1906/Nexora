// Notification Logic
import Notification from './notification.model.js';

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username profile.displayName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { $set: { isRead: true, readAt: Date.now() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: Date.now() } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read'
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

export const createAndEmitNotification = async (app, data) => {
  try {
    const { recipient, sender, type, content, extraData } = data;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      content,
      data: extraData || {}
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'username profile.displayName profile.avatar');

    const io = app.get('io');
    if (io) {
      io.to(recipient.toString()).emit('notification', populatedNotification);
    }

    return notification;
  } catch (error) {
    console.error('Create and emit notification error:', error);
    throw error;
  }
};
