import axios from './axiosConfig'

export const notificationApi = {
  getNotifications: () => axios.get('/notifications'),
  getUnreadCount: () => axios.get('/notifications/unread-count'),
  markAsRead: (notificationId) => axios.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => axios.patch('/notifications/read-all'),
  deleteNotification: (notificationId) => axios.delete(`/notifications/${notificationId}`),
  deleteAll: () => axios.delete('/notifications'),
}