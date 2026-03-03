import { useState, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'
import { showToast } from '../components/ui/Toast'

export const useMessages = (channelId) => {
  const { socket } = useSocket()
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message])
    scrollToBottom()
  }, [])

  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev =>
      prev.map(msg => msg._id === messageId ? { ...msg, ...updates } : msg)
    )
  }, [])

  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId))
  }, [])

  const setTyping = useCallback((userId, isTyping) => {
    setTypingUsers(prev => {
      if (isTyping) {
        return prev.includes(userId) ? prev : [...prev, userId]
      } else {
        return prev.filter(id => id !== userId)
      }
    })
  }, [])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const sendMessage = useCallback(async (text, replyTo = null) => {
    if (!text.trim()) return

    try {
      // Emit via socket
      socket?.emit('sendChannelMessage', {
        channelId,
        text: text.trim(),
        replyTo,
        timestamp: new Date(),
      })

      // Optimistically add message
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        text: text.trim(),
        sender: { _id: 'current-user', username: 'You' },
        createdAt: new Date().toISOString(),
        replyTo,
        isTemp: true,
      }

      addMessage(tempMessage)
      scrollToBottom()
    } catch (error) {
      showToast.error('Failed to send message')
    }
  }, [socket, channelId, addMessage])

  const editMessage = useCallback(async (messageId, newText) => {
    try {
      socket?.emit('editMessage', { messageId, text: newText })
      updateMessage(messageId, { text: newText, isEdited: true })
    } catch (error) {
      showToast.error('Failed to edit message')
    }
  }, [socket, updateMessage])

  const deleteMessage = useCallback(async (messageId) => {
    try {
      socket?.emit('deleteMessage', { messageId })
      removeMessage(messageId)
    } catch (error) {
      showToast.error('Failed to delete message')
    }
  }, [socket, removeMessage])

  const sendTyping = useCallback((isTyping) => {
    socket?.emit('channelTyping', { channelId, isTyping })
  }, [socket, channelId])

  return {
    messages,
    typingUsers,
    messagesEndRef,
    addMessage,
    updateMessage,
    removeMessage,
    setTyping,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
    scrollToBottom,
  }
}