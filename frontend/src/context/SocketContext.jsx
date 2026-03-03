import React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

export const SocketContext = createContext()  // Add this export

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      
      const socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketInstance.on('connect', () => {
        console.log('🔌 Socket connected')
        setConnected(true)
      })

      socketInstance.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
        setConnected(false)
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })

      socketInstance.on('user:online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])])
      })

      socketInstance.on('user:offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId))
      })

      socketInstance.on('friendRequestReceived', (data) => {
        // Handle friend request notification
      })

      socketInstance.on('friendRequestAccepted', (data) => {
        // Handle friend request accepted
      })

      socketInstance.on('gameInvite', (data) => {
        // Handle game invite
      })

      socketInstance.on('gameStarted', (data) => {
        // Handle game started
      })

      socketInstance.on('gameUpdated', (data) => {
        // Handle game update
      })

      socketInstance.on('gameEnded', (data) => {
        // Handle game ended
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
        socketInstance.off('connect')
        socketInstance.off('disconnect')
        socketInstance.off('connect_error')
        socketInstance.off('user:online')
        socketInstance.off('user:offline')
      }
    }
  }, [isAuthenticated, user])

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
    }
  }

  const value = {
    socket,
    connected,
    onlineUsers,
    emit,
    isOnline: (userId) => onlineUsers.includes(userId),
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}