import axios from './axiosConfig'

export const chatApi = {
  getChatList: () => axios.get('/chat/list'),
  getChatMessages: (chatId) => axios.get(`/chat/${chatId}`),
  sendMessage: (receiverId, text) => axios.post('/chat/send', { receiverId, text }),
  markAsRead: (chatId) => axios.patch(`/chat/${chatId}/read`),
}