import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios.js'
import toast from 'react-hot-toast';

const NexoraContext = createContext();

export const useNexora = () => {
  const context = useContext(NexoraContext);
  if (!context) {
    throw new Error('useNexora must be used within NexoraProvider');
  }
  return context;
};

export const NexoraProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Use the configured axios instance
      const { data } = await axios.get('/api/auth/me');

      if (data.success) {
        let userData = data.user;
        if (userData.profile?.avatar?.includes('res.cloudinary.com/demo/image/upload/v1/')) {
          userData.profile.avatar = `https://ui-avatars.com/api/?name=${userData.username}&background=8b5cf6&color=fff`;
        }
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Use the configured axios instance
      const { data } = await axios.post(
        '/api/auth/login',
        { email, password }
      );

      if (data.success) {
        let userData = data.user;
        if (userData.profile?.avatar?.includes('res.cloudinary.com/demo/image/upload/v1/')) {
          userData.profile.avatar = `https://ui-avatars.com/api/?name=${userData.username}&background=8b5cf6&color=fff`;
        }
        setUser(userData);
        setIsAuthenticated(true);
        toast.success(data.message || 'Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration with:', { username, email }); // Debug log
      
      // ✅ Use the configured axios instance
      const { data } = await axios.post(
        '/api/auth/register',
        { username, email, password }
      );

      if (data.success) {
        let userData = data.user;
        if (userData.profile?.avatar?.includes('res.cloudinary.com/demo/image/upload/v1/')) {
          userData.profile.avatar = `https://ui-avatars.com/api/?name=${userData.username}&background=8b5cf6&color=fff`;
        }
        setUser(userData);
        setIsAuthenticated(true);
        toast.success(data.message || 'Registration successful!');
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });

      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors;

      if (errors) {
        Object.values(errors).forEach(err => {
          toast.error(err);
        });
      } else {
        toast.error(message);
      }

      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {});
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isLogin,
    login,
    register,
    logout,
    toggleAuthMode,
    setUser,
    setIsAuthenticated
  };

  return (
    <NexoraContext.Provider value={value}>
      {children}
    </NexoraContext.Provider>
  );
};