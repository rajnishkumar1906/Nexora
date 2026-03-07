// Channel Logic
import Channel from './channel.model.js';
import ChannelMessage from './channel-message.model.js';
import ServerMember from '../servers/server-member.model.js';

export const createChannel = async (req, res) => {
  try {
    const { name, description, type, serverId, isPublic } = req.body;

    const membership = await ServerMember.findOne({
      server: serverId,
      user: req.user._id
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only server owners and admins can create channels'
      });
    }

    const lastChannel = await Channel.findOne({ server: serverId })
      .sort({ order: -1 });
    const order = lastChannel ? lastChannel.order + 1 : 0;

    const channel = await Channel.create({
      name,
      description,
      type: type || 'text',
      server: serverId,
      isPublic: isPublic === 'true' || isPublic === true,
      order
    });

    const io = req.app.get('io');
    io.to(serverId.toString()).emit('channel_created', channel);

    res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      channel
    });

  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create channel'
    });
  }
};

export const getServerChannels = async (req, res) => {
  try {
    const { serverId } = req.params;

    const membership = await ServerMember.findOne({
      server: serverId,
      user: req.user._id
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    const channels = await Channel.find({ server: serverId })
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      channels
    });

  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get channels'
    });
  }
};

export const getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('server', 'name icon');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const membership = await ServerMember.findOne({
      server: channel.server._id,
      user: req.user._id
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    res.status(200).json({
      success: true,
      channel
    });

  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get channel details'
    });
  }
};

export const updateChannel = async (req, res) => {
  try {
    const { name, description, isPublic, order } = req.body;
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const membership = await ServerMember.findOne({
      server: channel.server,
      user: req.user._id
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only server owners and admins can update channels'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic === 'true' || isPublic === true;
    if (order !== undefined) updateData.order = order;

    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    const io = req.app.get('io');
    io.to(updatedChannel.server.toString()).emit('channel_updated', updatedChannel);

    res.status(200).json({
      success: true,
      message: 'Channel updated successfully',
      channel: updatedChannel
    });

  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update channel'
    });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const membership = await ServerMember.findOne({
      server: channel.server,
      user: req.user._id
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only server owners and admins can delete channels'
      });
    }

    if (channel.name === 'general') {
      return res.status(400).json({
        success: false,
        message: 'The general channel cannot be deleted'
      });
    }

    await ChannelMessage.deleteMany({ channel: channelId });

    const serverId = channel.server.toString();

    await Channel.findByIdAndDelete(channelId);

    const io = req.app.get('io');
    io.to(serverId).emit('channel_deleted', { serverId, channelId });

    res.status(200).json({
      success: true,
      message: 'Channel deleted successfully'
    });

  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete channel'
    });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const membership = await ServerMember.findOne({
      server: channel.server,
      user: req.user._id
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    const skip = (page - 1) * limit;

    const messages = await ChannelMessage.find({ channel: id })
      .populate('author', 'username profile.displayName profile.avatar')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'author',
          select: 'username profile.displayName profile.avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ChannelMessage.countDocuments({ channel: id });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};
