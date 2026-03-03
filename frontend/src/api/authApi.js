import axios from './axiosConfig'

export const authApi = {
  signup: (userData) => axios.post('/auth/signup', userData),
  login: (credentials) => axios.post('/auth/login', credentials),
  logout: () => axios.post('/auth/logout'),
  getMe: () => axios.get('/auth/me'),
}