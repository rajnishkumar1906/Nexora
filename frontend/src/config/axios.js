import axios from 'axios';

// Smart baseURL that works in all environments
const getBaseURL = () => {
  // 1. If VITE_API_URL is set (production or custom), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. If in production but no VITE_API_URL, use relative path (same domain)
  if (import.meta.env.PROD) {
    return '';
  }
  
  // 3. Default for local development
  return 'http://localhost:5000';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Important for cookies
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Automatically adds token if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // Log requests in development only
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    // You can add custom headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh if needed (optional)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        await axiosInstance.post('/api/auth/refresh-token');
        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Network errors - backend might be down
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - backend server might be down');
      // You can show a toast notification here
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;