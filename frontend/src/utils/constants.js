export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const SOCKET_URL = API_BASE_URL.replace('/api', '')

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
}

export const CHANNEL_TYPES = {
  TEXT: 'text',
  VOICE: 'voice',
}

export const GAME_TYPES = {
  TICTACTOE: 'tictactoe',
}

export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
}

export const SERVER_CATEGORIES = [
  'Gaming',
  'Study',
  'Music',
  'Tech',
  'Art',
  'Sports',
  'Social',
  'Other',
]

export const SOCKET_EVENTS = {
  // Chat events
  JOIN_CHAT: 'joinChat',
  LEAVE_CHAT: 'leaveChat',
  SEND_MESSAGE: 'sendDirectMessage',
  NEW_MESSAGE: 'newDirectMessage',
  TYPING: 'typing',
  
  // Channel events
  JOIN_CHANNEL: 'joinChannel',
  LEAVE_CHANNEL: 'leaveChannel',
  SEND_CHANNEL_MESSAGE: 'sendChannelMessage',
  NEW_CHANNEL_MESSAGE: 'receiveChannelMessage',
  
  // Game events
  JOIN_GAME: 'joinGame',
  GAME_MOVE: 'gameMove',
  GAME_UPDATE: 'gameUpdated',
  GAME_END: 'gameEnded',
}