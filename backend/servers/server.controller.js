// Server Logic
import Server from './server.model.js';
import ServerMember from './server-member.model.js';
import Channel from '../channels/channel.model.js';
import User from '../auth/user.model.js';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const uploadToCloudinary = (buffer, folder, publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `nexora/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const createServer = async (req, res) => {
  try {
    const { name, description, isPublic, category } = req.body;
    const inviteCode = generateInviteCode();

    const server = await Server.create({
      name,
      description,
      owner: req.user._id,
      inviteCode,
      isPublic: isPublic === 'true' || isPublic === true,
      category: category || 'other'
    });

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'server-icons',
        `server-${server._id}`
      );
      server.icon = result.secure_url;
      server.iconPublicId = result.public_id;
      await server.save();
    }

    await ServerMember.create({
      server: server._id,
      user: req.user._id,
      role: 'owner'
    });
    
    try {
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.servers': 1 } });
    } catch (e) {
      console.error('Failed to increment user servers stat on create:', e);
    }

    await Channel.create({
      name: 'general',
      description: 'The general channel for everyone',
      server: server._id,
      order: 0
    });

    res.status(201).json({
      success: true,
      message: 'Server created successfully',
      server
    });

  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create server'
    });
  }
};

export const getMyServers = async (req, res) => {
  try {
    const memberships = await ServerMember.find({ user: req.user._id })
      .populate({
        path: 'server',
        select: 'name icon description owner inviteCode isPublic category'
      });

    const servers = memberships.map(m => m.server).filter(s => s !== null);

    res.status(200).json({
      success: true,
      servers
    });

  } catch (error) {
    console.error('Get my servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your servers'
    });
  }
};

export const getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('owner', 'username profile.displayName profile.avatar');

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    const membership = await ServerMember.findOne({
      server: server._id,
      user: req.user._id
    });

    if (!membership && !server.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this private server'
      });
    }

    res.status(200).json({
      success: true,
      server,
      membership: membership || null
    });

  } catch (error) {
    console.error('Get server by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get server details'
    });
  }
};

export const joinServer = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    let server;
    
    // Check if inviteCode is actually a Server ID (for direct join from Explore)
    if (inviteCode.match(/^[0-9a-fA-F]{24}$/)) {
      server = await Server.findById(inviteCode);
    } else {
      server = await Server.findOne({ inviteCode });
    }

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code or server ID'
      });
    }

    // Only allow direct joining if it's public, otherwise require inviteCode match
    if (!server.isPublic && server.inviteCode !== inviteCode) {
      return res.status(403).json({
        success: false,
        message: 'This server is private. You need an invite link to join.'
      });
    }

    const existingMember = await ServerMember.findOne({
      server: server._id,
      user: req.user._id
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this server'
      });
    }

    await ServerMember.create({
      server: server._id,
      user: req.user._id,
      role: 'member'
    });
    
    try {
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.servers': 1 } });
    } catch (e) {
      console.error('Failed to increment user servers stat on join:', e);
    }

    const io = req.app.get('io');
    const memberData = await ServerMember.findOne({ server: server._id, user: req.user._id })
      .populate('user', 'username profile.displayName profile.avatar profile.status');
    
    io.to(server._id.toString()).emit('member_joined', {
      serverId: server._id,
      member: memberData
    });

    let defaultChannel = null;
    try {
      defaultChannel = await Channel.findOne({ server: server._id }).sort({ order: 1, createdAt: 1 });
    } catch (e) {
      console.error('Failed to fetch default channel after join:', e);
    }

    res.status(200).json({
      success: true,
      message: `Joined ${server.name} successfully`,
      server,
      membership: memberData,
      defaultChannelId: defaultChannel?._id || null
    });

  } catch (error) {
    console.error('Join server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join server'
    });
  }
};

export const leaveServer = async (req, res) => {
  try {
    const serverId = req.params.id;
    const membership = await ServerMember.findOne({
      server: serverId,
      user: req.user._id
    });

    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    if (membership.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Owners cannot leave their own server. Delete it instead.'
      });
    }

    await ServerMember.findByIdAndDelete(membership._id);

    const io = req.app.get('io');
    io.to(serverId.toString()).emit('member_left', {
      serverId,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Left server successfully'
    });

  } catch (error) {
    console.error('Leave server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave server'
    });
  }
};

export const exploreServers = async (req, res) => {
  try {
    const { q, category } = req.query;
    
    const query = { isPublic: true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const servers = await Server.find(query)
      .limit(20)
      .sort({ createdAt: -1 });

    // Enrich with membership and member counts
    const serverIds = servers.map(s => s._id);
    const userId = req.user?._id;

    let myMemberships = [];
    let counts = [];
    try {
      myMemberships = await ServerMember.find({ user: userId, server: { $in: serverIds } })
        .select('server');
      counts = await ServerMember.aggregate([
        { $match: { server: { $in: serverIds } } },
        { $group: { _id: '$server', count: { $sum: 1 } } }
      ]);
    } catch (e) {
      console.error('Explore enrichment error:', e);
    }

    const memberSet = new Set(myMemberships.map(m => m.server.toString()));
    const countMap = counts.reduce((acc, c) => {
      acc[c._id.toString()] = c.count;
      return acc;
    }, {});

    const enriched = servers.map(s => {
      const obj = s.toObject();
      obj.isMember = memberSet.has(s._id.toString());
      obj.memberCount = countMap[s._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      servers: enriched
    });
  } catch (error) {
    console.error('Explore servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to explore communities'
    });
  }
};

export const updateServer = async (req, res) => {
  try {
    const serverId = req.params.id;
    const { name, description, isPublic, category } = req.body;

    const membership = await ServerMember.findOne({
      server: serverId,
      user: req.user._id
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this server'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic === 'true' || isPublic === true;
    if (category) updateData.category = category;

    let server = await Server.findById(serverId);

    if (req.file) {
      if (server.iconPublicId) {
        await deleteFromCloudinary(server.iconPublicId);
      }
      const result = await uploadToCloudinary(
        req.file.buffer,
        'server-icons',
        `server-${server._id}`
      );
      updateData.icon = result.secure_url;
      updateData.iconPublicId = result.public_id;
    }

    server = await Server.findByIdAndUpdate(
      serverId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    const io = req.app.get('io');
    io.to(serverId.toString()).emit('server_updated', server);

    res.status(200).json({
      success: true,
      message: 'Server updated successfully',
      server
    });

  } catch (error) {
    console.error('Update server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update server'
    });
  }
};

export const deleteServer = async (req, res) => {
  try {
    const serverId = req.params.id;
    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    if (server.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete the server'
      });
    }

    if (server.iconPublicId) {
      await deleteFromCloudinary(server.iconPublicId);
    }

    await ServerMember.deleteMany({ server: serverId });
    await Channel.deleteMany({ server: serverId });
    await Server.findByIdAndDelete(serverId);

    res.status(200).json({
      success: true,
      message: 'Server deleted successfully'
    });

  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete server'
    });
  }
};

export const getServerMembers = async (req, res) => {
  try {
    const serverId = req.params.id;
    const members = await ServerMember.find({ server: serverId })
      .populate('user', 'username profile.displayName profile.avatar profile.status')
      .sort({ role: 1, joinedAt: 1 });

    res.status(200).json({
      success: true,
      members
    });

  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get server members'
    });
  }
};

export const kickMember = async (req, res) => {
  try {
    const { id: serverId, userId } = req.params;

    const requester = await ServerMember.findOne({ server: serverId, user: req.user._id });
    if (!requester || !['owner', 'admin'].includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to kick members' });
    }

    const target = await ServerMember.findOne({ server: serverId, user: userId });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (target.role === 'owner') {
      return res.status(403).json({ success: false, message: 'Cannot kick the server owner' });
    }
    if (target.role === 'admin' && requester.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only owners can kick admins' });
    }

    await ServerMember.findByIdAndDelete(target._id);

    const io = req.app.get('io');
    io.to(serverId.toString()).emit('member_kicked', {
      serverId,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Member kicked successfully'
    });
  } catch (error) {
    console.error('Kick member error:', error);
    res.status(500).json({ success: false, message: 'Failed to kick member' });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { id: serverId, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const server = await Server.findById(serverId);
    if (server.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only server owner can change roles' });
    }

    const member = await ServerMember.findOneAndUpdate(
      { server: serverId, user: userId },
      { $set: { role } },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const io = req.app.get('io');
    io.to(serverId.toString()).emit('member_role_updated', {
      serverId,
      userId,
      role
    });

    res.status(200).json({
      success: true,
      message: `Member role updated to ${role}`,
      member
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Failed to update member role' });
  }
};
