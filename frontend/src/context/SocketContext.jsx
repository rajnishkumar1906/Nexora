import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useNexora } from './NexoraContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useNexora();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  // Get socket URL based on environment
  const getSocketURL = useCallback(() => {
    // 1. Use VITE_SOCKET_URL if provided
    if (import.meta.env.VITE_SOCKET_URL) {
      return import.meta.env.VITE_SOCKET_URL;
    }
    
    // 2. Use VITE_API_URL as fallback
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // 3. In production with no env vars, use same origin
    if (import.meta.env.PROD) {
      return window.location.origin;
    }
    
    // 4. Default for local development
    return 'http://localhost:5000';
  }, []);

  // Connect to socket
  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !user || socketRef.current?.connected) {
      return;
    }

    const socketUrl = getSocketURL();
    console.log('🔌 Connecting to socket at:', socketUrl);

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true,
      query: {
        userId: user._id,
        username: user.username,
        timestamp: Date.now()
      }
    });

    socketRef.current = newSocket;

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected! ID:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Announce user presence
      newSocket.emit('user_connected', {
        userId: user._id,
        username: user.username,
        displayName: user.profile?.displayName || user.username
      });

      toast.success('Connected to server', {
        id: 'socket-connect',
        duration: 2000
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected - attempt to reconnect
        setTimeout(() => connectSocket(), 1000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      setIsConnected(false);
      
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current <= maxReconnectAttempts) {
        console.log(`🔄 Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
      } else {
        toast.error('Unable to connect to server. Please refresh the page.', {
          id: 'socket-error',
          duration: 5000
        });
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      toast.success('Reconnected to server', {
        id: 'socket-reconnect',
        duration: 2000
      });
      
      // Re-announce presence after reconnect
      newSocket.emit('user_connected', {
        userId: user._id,
        username: user.username,
        displayName: user.profile?.displayName || user.username
      });
    });

    // User status events
    newSocket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => {
        if (status === 'online') {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    // Handle notifications
    newSocket.on('notification', (notification) => {
      toast.custom((t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md border-l-4 border-primary-500">
          <div className="flex items-start gap-3">
            <img 
              src={notification.sender?.profile?.avatar || `https://ui-avatars.com/api/?name=${notification.sender?.username || 'N'}`}
              className="w-10 h-10 rounded-full"
              alt=""
            />
            <div className="flex-1">
              <p className="font-bold text-gray-800">
                {notification.sender?.profile?.displayName || notification.sender?.username}
              </p>
              <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
            </div>
            <button 
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    return newSocket;
  }, [isAuthenticated, user, getSocketURL]);

  // Initialize socket connection
  useEffect(() => {
    const socket = connectSocket();

    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  const value = {
    socket: socketRef.current,
    onlineUsers,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};