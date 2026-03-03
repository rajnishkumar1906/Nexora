import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'
import { channelApi } from '../api/channelApi'
import { showToast } from '../components/ui/Toast'

export const useChannel = (channelId) => {
  const { socket } = useSocket()
  const [messages, setMessages] = useState([])
  const [channel, setChannel] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (channelId) {
      loadChannel()
      loadMessages(true)
      joinChannel()

      return () => {
        leaveChannel()
        setMessages([])
        setPage(1)
      }
    }
  }, [channelId])

  useEffect(() => {
    if (!socket) return

    socket.on('receiveChannelMessage', handleNewMessage)
    socket.on('messageEdited', handleMessageEdited)
    socket.on('messageDeleted', handleMessageDeleted)
    socket.on('userTyping', handleUserTyping)

    return () => {
      socket.off('receiveChannelMessage', handleNewMessage)
      socket.off('messageEdited', handleMessageEdited)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('userTyping', handleUserTyping)
    }
  }, [socket])

  const loadChannel = async () => {
    try {
      // You might need to add a getChannel endpoint
      // const { data } = await channelApi.getChannel(channelId)
      // setChannel(data.channel)
    } catch (error) {
      console.error('Failed to load channel')
    }
  }

  const loadMessages = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setLoadingMore(true)
      }

      const { data } = await channelApi.getMessages(channelId, reset ? 1 : page)
      
      setMessages(prev => reset ? data.messages : [...prev, ...data.messages])
      setHasMore(data.pagination.page < data.pagination.pages)
      setPage(prev => reset ? 2 : prev + 1)
    } catch (error) {
      showToast.error('Failed to load messages')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleNewMessage = (message) => {
    if (message.channel === channelId) {
      setMessages(prev => [...prev, message])
    }
  }

  const handleMessageEdited = ({ messageId, text, editedAt }) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, text, isEdited: true, editedAt } : msg
      )
    )
  }

  const handleMessageDeleted = ({ messageId }) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId))
  }

  const handleUserTyping = ({ userId, channelId: cId, isTyping }) => {
    if (cId === channelId) {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(userId) ? prev : [...prev, userId]
        } else {
          return prev.filter(id => id !== userId)
        }
      })
    }
  }

  const joinChannel = useCallback(() => {
    socket?.emit('joinChannel', channelId)
  }, [socket, channelId])

  const leaveChannel = useCallback(() => {
    socket?.emit('leaveChannel', channelId)
  }, [socket, channelId])

  const sendMessage = async (text, replyTo = null) => {
    try {
      const { data } = await channelApi.sendMessage(channelId, text, replyTo)
      
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

  const sendTyping = (isTyping) => {
    socket?.emit('channelTyping', { channelId, isTyping })
  }

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadMessages()
    }
  }

  return {
    messages,
    channel,
    typingUsers,
    loading,
    loadingMore,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
    loadMore,
    joinChannel,
    leaveChannel,
  }
}