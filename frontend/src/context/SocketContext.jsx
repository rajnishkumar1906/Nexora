import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Cleanup function
  const cleanupSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      console.log('🧹 Cleaning up socket connection');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      cleanupSocket();
      return;
    }

    if (socketRef.current?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    // Environment-aware socket connection
    // For Vercel (frontend) -> Render (backend) deployment:
    // 1. Use VITE_API_URL if provided (recommended for Vercel)
    // 2. Fallback to current origin (if served from same server)
    // 3. Last fallback to localhost for development
    const backendUrl = import.meta.env.VITE_API_URL || 
                       (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
    
    console.log('📡 Connecting to backend:', backendUrl);
    
    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      path: '/socket.io',
      autoConnect: true,
      forceNew: true,
      query: {
        userId: user._id,
        username: user.username
      }
    });

    socketRef.current = newSocket;

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected directly to backend! ID:', newSocket.id);
      setIsConnected(true);
      
      newSocket.emit('user_connected', {
        userId: user._id,
        username: user.username,
        displayName: user.profile?.displayName || user.username
      });

      toast.success('Connected to real-time server', {
        id: 'socket-connect',
        duration: 2000
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      setIsConnected(false);
      
      // Only show error after multiple attempts
      if (!socketRef.current?.reconnecting) {
        toast.error('Unable to connect to server. Retrying...', {
          id: 'socket-error',
          duration: 3000
        });
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      toast.success('Reconnected to server', {
        id: 'socket-reconnect',
        duration: 2000
      });
    });

    // Event handlers (keep all your existing event handlers)
    newSocket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => {
        if (status === 'online') {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    newSocket.on('notification', (notification) => {
      toast.custom((t) => (
        <div className="bg-white rounded-lg shadow-lg border border-primary-200 p-4 max-w-md">
          <div className="flex items-start space-x-3">
            <img 
              src={notification.sender?.profile?.avatar || `https://ui-avatars.com/api/?name=${notification.sender?.username || 'Nexora'}&background=0ea5e9&color=fff`} 
              className="w-10 h-10 rounded-full object-cover" 
              alt="sender"
            />
            <div className="flex-1">
              <p className="font-bold text-primary-600">
                {notification.sender?.profile?.displayName || notification.sender?.username || 'Nexora'}
              </p>
              <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
              {notification.type === 'game_invite' && (
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.location.href = `/game/${notification.data.sessionId}`;
                  }}
                  className="mt-2 bg-primary-600 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-primary-500 transition-colors"
                >
                  JOIN GAME
                </button>
              )}
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

    newSocket.on('new_dm_notification', ({ roomId, message }) => {
      toast.custom((t) => (
        <div className="bg-white rounded-lg shadow-lg border border-primary-200 p-4 max-w-md">
          <p className="font-bold text-primary-600">New message from {message.author}</p>
          <p className="text-sm text-gray-600 mt-1 truncate">{message.content}</p>
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = `/chat/${roomId}`;
              }}
              className="bg-primary-600 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-primary-500"
            >
              OPEN CHAT
            </button>
          </div>
        </div>
      ), { duration: 4000 });
    });

    newSocket.on('rematch_request', ({ sessionId, senderName }) => {
      toast.custom((t) => (
        <div className="bg-white rounded-lg shadow-lg border border-primary-200 p-4 max-w-md">
          <p className="font-bold text-primary-600 mb-3">{senderName} wants a rematch!</p>
          <div className="flex space-x-2">
            <button 
              onClick={() => { 
                toast.dismiss(t.id);
                window.location.href = `/game/${sessionId}`;
              }} 
              className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-md text-xs font-bold hover:bg-primary-500"
            >
              ACCEPT
            </button>
            <button 
              onClick={() => toast.dismiss(t.id)} 
              className="flex-1 bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-xs font-bold hover:bg-primary-200"
            >
              DECLINE
            </button>
          </div>
        </div>
      ), { duration: 8000 });
    });

    setSocket(newSocket);

    return () => {
      cleanupSocket();
    };
  }, [isAuthenticated, user, cleanupSocket]);

  const value = {
    socket,
    onlineUsers,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;