export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member'
};

// User status
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy'
};

// Channel types
export const CHANNEL_TYPES = {
  TEXT: 'text',
  VOICE: 'voice'
};

// Game types
export const GAME_TYPES = {
  TICTACTOE: 'tictactoe',
  ROCK_PAPER_SCISSORS: 'rockpaperscissors'
};

// Game status
export const GAME_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
};

// Notification types
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_request_accepted',
  GAME_INVITE: 'game_invite',
  GAME_TURN: 'game_turn',
  GAME_RESULT: 'game_result',
  CHANNEL_MENTION: 'channel_mention',
  SERVER_INVITE: 'server_invite',
  MESSAGE: 'message'
};

// Server categories
export const SERVER_CATEGORIES = [
  'Gaming',
  'Study',
  'Music',
  'Tech',
  'Art',
  'Sports',
  'Social',
  'Other'
];

// Friend request status
export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// File upload limits (in bytes)
export const UPLOAD_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  COVER: 10 * 1024 * 1024, // 10MB
  ATTACHMENT: 20 * 1024 * 1024 // 20MB
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Socket events
export const SOCKET_EVENTS = {
  // Chat events
  JOIN_CHAT: 'joinChat',
  LEAVE_CHAT: 'leaveChat',
  SEND_MESSAGE: 'sendDirectMessage',
  NEW_MESSAGE: 'newDirectMessage',
  TYPING: 'typing',
  MESSAGE_READ: 'messagesRead',
  
  // Channel events
  JOIN_CHANNEL: 'joinChannel',
  LEAVE_CHANNEL: 'leaveChannel',
  SEND_CHANNEL_MESSAGE: 'sendChannelMessage',
  NEW_CHANNEL_MESSAGE: 'receiveChannelMessage',
  CHANNEL_TYPING: 'channelTyping',
  
  // Game events
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  GAME_MOVE: 'gameMove',
  GAME_UPDATE: 'gameUpdated',
  GAME_END: 'gameEnded',
  
  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline'
};