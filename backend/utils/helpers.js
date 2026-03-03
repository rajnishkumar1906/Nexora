import bcrypt from 'bcrypt';

export const generateRandomString = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

export const generateInviteCode = () => {
  return generateRandomString(8);
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const extractMentions = (text) => {
  const mentions = text.match(/@(\w+)/g) || [];
  return mentions.map((m) => m.substring(1));
};

export const createChatId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

export const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return d.toLocaleDateString();
};

export const isOnline = (lastSeen, status) => {
  if (status === 'online') return true;
  if (!lastSeen) return false;

  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - new Date(lastSeen).getTime() < fiveMinutes;
};

export const paginate = (array, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: array.slice(start, end),
    pagination: {
      page,
      limit,
      total: array.length,
      pages: Math.ceil(array.length / limit),
    },
  };
};

