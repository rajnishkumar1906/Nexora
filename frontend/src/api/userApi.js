import axios from './axiosConfig'

export const userApi = {
  getUserById: (userId) => axios.get(`/users/${userId}`),
  getProfileByUserId: (userId) => axios.get(`/users/${userId}/profile`),
  getOwnProfile: () => axios.get('/users/profile/me'),
  updateProfile: (formData) => axios.patch('/users/profile/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (status) => axios.patch('/users/status', { status }),
}