import axios from './axiosConfig'

export const friendApi = {
  getFriends: () => axios.get('/friends'),
  getFriendRequests: () => axios.get('/friends/requests'),
  getSentRequests: () => axios.get('/friends/sent'),
  getFriendStatus: (friendId) => axios.get(`/friends/status/${friendId}`),
  sendRequest: (recipientId) => axios.post(`/friends/request/${recipientId}`),
  acceptRequest: (requestId) => axios.post(`/friends/accept/${requestId}`),
  rejectRequest: (requestId) => axios.post(`/friends/reject/${requestId}`),
  cancelRequest: (requestId) => axios.post(`/friends/cancel/${requestId}`),
  removeFriend: (friendId) => axios.delete(`/friends/${friendId}`),
}