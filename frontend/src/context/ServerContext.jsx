import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext' 

export const ServerContext = createContext()

export const useServer = () => {
  const context = useContext(ServerContext)
  if (!context) {
    throw new Error('useServer must be used within ServerProvider')
  }
  return context
}

export const ServerProvider = ({ children }) => {
  const { user } = useAuth()  // Get user from auth context
  const [currentServer, setCurrentServer] = useState(null)
  const [currentChannel, setCurrentChannel] = useState(null)
  const [servers, setServers] = useState([])
  const [channels, setChannels] = useState([])
  const [serverMembers, setServerMembers] = useState([])
  const [loading, setLoading] = useState(false)

  // Helper values
  const isServerOwner = currentServer?.owner === user?._id
  const isServerAdmin = currentServer?.role === 'admin' || currentServer?.role === 'owner'

  const value = {
    // State
    currentServer,
    currentChannel,
    servers,
    channels,
    serverMembers,
    loading,
    
    // Setters
    setCurrentServer,
    setCurrentChannel,
    setServers,
    setChannels,
    setServerMembers,
    setLoading,
    
    // Helpers
    isServerOwner,
    isServerAdmin,
  }

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
}