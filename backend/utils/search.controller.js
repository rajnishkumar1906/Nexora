// Search Logic
import User from '../auth/user.model.js';
import Server from '../servers/server.model.js';
import ChannelMessage from '../channels/channel-message.model.js';
import { asyncHandler } from './helpers.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const { q, type = 'all' } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  const results = {};

  if (type === 'all' || type === 'users') {
    results.users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { 'profile.displayName': { $regex: q, $options: 'i' } }
      ]
    })
    .select('username profile.displayName profile.avatar profile.status')
    .limit(10);
  }

  if (type === 'all' || type === 'servers') {
    results.servers = await Server.find({
      $and: [
        { isPublic: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name icon description category memberCount')
    .limit(10);
  }

  if (type === 'all' || type === 'messages') {
    results.messages = await ChannelMessage.find({
      content: { $regex: q, $options: 'i' }
    })
    .populate('author', 'username profile.displayName profile.avatar')
    .populate('channel', 'name')
    .populate('server', 'name')
    .sort({ createdAt: -1 })
    .limit(20);
  }

  if (results.users) {
    results.users = results.users.map(user => {
      const u = user.toObject();
      if (u.profile?.avatar?.includes('res.cloudinary.com/demo/image/upload/v1/')) {
        u.profile.avatar = `https://ui-avatars.com/api/?name=${u.username}&background=8b5cf6&color=fff`;
      }
      return u;
    });
  }

  if (results.servers) {
    results.servers = results.servers.map(server => {
      const s = server.toObject();
      if (s.icon?.includes('res.cloudinary.com/demo/image/upload/v1/')) {
        s.icon = `https://ui-avatars.com/api/?name=${s.name.replace(/\s+/g, '+')}&background=10b981&color=fff&bold=true`;
      }
      return s;
    });
  }

  if (results.messages) {
    results.messages = results.messages.map(msg => {
      const m = msg.toObject();
      if (m.author?.profile?.avatar?.includes('res.cloudinary.com/demo/image/upload/v1/')) {
        m.author.profile.avatar = `https://ui-avatars.com/api/?name=${m.author.username}&background=8b5cf6&color=fff`;
      }
      return m;
    });
  }

  res.status(200).json({
    success: true,
    results
  });
});
