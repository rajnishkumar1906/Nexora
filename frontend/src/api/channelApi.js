import axios from './axiosConfig'

export const channelApi = {
  getChannels: (serverId) => axios.get(`/channels/server/${serverId}`),
  createChannel: (serverId, data) => axios.post(`/channels/server/${serverId}`, data),
  updateChannel: (channelId, data) => axios.patch(`/channels/${channelId}`, data),
  deleteChannel: (channelId) => axios.delete(`/channels/${channelId}`),
  getMessages: (channelId, page = 1, limit = 50) => 
    axios.get(`/channels/${channelId}/messages?page=${page}&limit=${limit}`),
  sendMessage: (channelId, text, replyTo = null) => 
    axios.post(`/channels/${channelId}/messages`, { text, replyTo }),
  editMessage: (messageId, text) => 
    axios.patch(`/channels/messages/${messageId}`, { text }),
  deleteMessage: (messageId) => axios.delete(`/channels/messages/${messageId}`),
}