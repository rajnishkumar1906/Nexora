import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { chatApi } from '../../api/chatApi'
import MessageList from '../chat/MessageList'
import MessageInput from '../chat/MessageInput'
import Avatar from '../ui/Avatar'
import { showToast } from '../ui/Toast'
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react'

const DMChat = () => {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { socket } = useSocket()
  
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    if (chatId) {
      loadChat()
      loadMessages()
      
      // Join chat room
      socket?.emit('joinChat', chatId)
      
      return () => {
        socket?.emit('leaveChat', chatId)
      }
    }
  }, [chatId])

  useEffect(() => {
    if (!socket) return

    socket.on('newDirectMessage', ({ message, from }) => {
      if (from === otherUser?._id) {
        setMessages(prev => [...prev, { ...message, sender: otherUser }])
      }
    })

    socket.on('userTyping', ({ userId, isTyping }) => {
      if (userId !== currentUser?._id) {
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
      socket.off('newDirectMessage')
      socket.off('userTyping')
    }
  }, [socket, otherUser, currentUser])

  const loadChat = async () => {
    try {
      const { data } = await chatApi.getChatMessages(chatId)
      const other = data.users?.find(u => u._id !== currentUser?._id)
      setOtherUser(other)
    } catch (error) {
      showToast.error('Failed to load chat')
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const { data } = await chatApi.getChatMessages(chatId)
      setMessages(data.messages || [])
      
      // Mark messages as read
      await chatApi.markAsRead(chatId)
    } catch (error) {
      showToast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async ({ text }) => {
    try {
      // Emit via socket for real-time
      socket?.emit('sendDirectMessage', {
        chatId,
        receiverId: otherUser?._id,
        text
      })

      // Save to database
      const { data } = await chatApi.sendMessage(otherUser?._id, text)
      
      // Add to local state
      const newMessage = {
        ...data.message,
        sender: currentUser
      }
      setMessages(prev => [...prev, newMessage])
    } catch (error) {
      showToast.error('Failed to send message')
    }
  }

  const handleTyping = (isTyping) => {
    socket?.emit('typing', { chatId, isTyping })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dm')}
            className="mr-3 p-1 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          
          {otherUser && (
            <>
              <Avatar
                src={otherUser.avatar}
                name={otherUser.username}
                size="sm"
                status={otherUser.status}
              />
              <div className="ml-3">
                <h2 className="font-semibold text-gray-900">{otherUser.username}</h2>
                <p className="text-xs text-gray-500">
                  {otherUser.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Phone size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Video size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        typingUsers={typingUsers.map(id => 
          otherUser?._id === id ? otherUser?.username : ''
        ).filter(Boolean)}
        currentUser={currentUser}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={!otherUser}
      />
    </div>
  )
}

export default DMChat