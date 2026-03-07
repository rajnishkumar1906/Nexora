import axios from 'axios';

// Environment-aware baseURL for axios
// 1. VITE_API_URL (recommended for Vercel/Render separate domains)
// 2. Empty string (relative path if served from the same server)
// 3. Localhost (for development)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' && import.meta.env.DEV) {
      console.error('Network error - make sure the backend server is running on port 5000');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;