import { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'
import { channelApi } from '../api/channelApi'
import { showToast } from '../components/ui/Toast'

const ChannelContext = createContext()

export const useChannel = () => {
  const context = useContext(ChannelContext)
  if (!context) {
    throw new Error('useChannel must be used within ChannelProvider')
  }
  return context
}

export const ChannelProvider = ({ children }) => {
  const { socket } = useSocket()
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!socket) return

    // Listen for new messages
    socket.on('receiveChannelMessage', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Listen for message edits
    socket.on('messageEdited', ({ messageId, text, editedAt }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, text, isEdited: true, editedAt } : msg
        )
      )
    })

    // Listen for message deletions
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId))
    })

    // Listen for typing indicators
    socket.on('userTyping', ({ userId, channelId, isTyping }) => {
      if (channelId === currentChannel?._id) {
        setTypingUsers(prev => {
          if (isTyping) {
            return prev.includes(userId) ? prev : [...prev, userId]
          } else {
            return prev.filter(id => id !== userId)
          }
        })
      }
    })

    return () => {
      socket.off('receiveChannelMessage')
      socket.off('messageEdited')
      socket.off('messageDeleted')
      socket.off('userTyping')
    }
  }, [socket])

  const loadMessages = async (channelId, reset = false) => {
    try {
      setLoading(true)
      const newPage = reset ? 1 : page
      const { data } = await channelApi.getMessages(channelId, newPage)
      
      setMessages(prev => reset ? data.messages : [...data.messages, ...prev])
      setHasMore(data.pagination.page < data.pagination.pages)
      setPage(newPage + 1)
    } catch (error) {
      showToast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (channelId, text, replyTo = null) => {
    try {
      const { data } = await channelApi.sendMessage(channelId, text, replyTo)
      
      // Emit via socket for real-time
      socket?.emit('sendChannelMessage', {
        channelId,
        text,
        replyTo,
        tempId: Date.now()
      })

      return data.message
    } catch (error) {
      showToast.error('Failed to send message')
      throw error
    }
  }

  const editMessage = async (messageId, text) => {
    try {
      await channelApi.editMessage(messageId, text)
    } catch (error) {
      showToast.error('Failed to edit message')
      throw error
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      await channelApi.deleteMessage(messageId)
    } catch (error) {
      showToast.error('Failed to delete message')
      throw error
    }
  }

  const sendTyping = (channelId, isTyping) => {
    socket?.emit('channelTyping', { channelId, isTyping })
  }

  const joinChannel = (channelId) => {
    socket?.emit('joinChannel', channelId)
  }

  const leaveChannel = (channelId) => {
    socket?.emit('leaveChannel', channelId)
  }

  const clearMessages = () => {
    setMessages([])
    setTypingUsers([])
    setPage(1)
    setHasMore(true)
  }

  const value = {
    // State
    messages,
    typingUsers,
    loading,
    hasMore,
    
    // Actions
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
    joinChannel,
    leaveChannel,
    clearMessages,
  }

  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
}