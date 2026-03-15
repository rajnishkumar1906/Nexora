import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios'; // Import our configured axios instance
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

  // Check if user is logged in on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      
      if (data.success && data.user) {
        // Fix avatar if needed
        let userData = data.user;
        if (userData.profile?.avatar?.includes('cloudinary.com/demo')) {
          userData.profile.avatar = `https://ui-avatars.com/api/?name=${userData.username}&background=8b5cf6&color=fff`;
        }
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // 401 is expected for unauthenticated users
      if (error.response?.status !== 401) {
        console.error('Check user error:', error);
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });

      if (data.success) {
        let userData = data.user;
        // Fix avatar if needed
        if (userData.profile?.avatar?.includes('cloudinary.com/demo')) {
          userData.profile.avatar = `https://ui-avatars.com/api/?name=${userData.username}&background=8b5cf6&color=fff`;
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        toast.success(data.message || 'Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        errors.forEach(err => toast.error(err.msg || err));
      } else {
        toast.error(message);
      }
      
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (data.success) {
        let userData = data.user;
        // Fix avatar if needed
        if (userData.profile?.avatar?.includes('cloudinary.com/demo')) {
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

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const toggleAuthMode = () => setIsLogin(!isLogin);

  const value = {
    user,
    loading,
    isAuthenticated,
    isLogin,
    register,
    login,
    logout,
    toggleAuthMode
  };

  return (
    <NexoraContext.Provider value={value}>
      {children}
    </NexoraContext.Provider>
  );
};