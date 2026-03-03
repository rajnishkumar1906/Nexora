import React from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'

const DMItem = ({ chat, currentUser, onClick }) => {
  const { chatId } = useParams()
  const isActive = chatId === chat.chatId

  if (!chat || !chat.user) return null

  const { user, lastMessage, unreadCount } = chat
  const timeAgo = lastMessage?.createdAt 
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
    : null

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors
        ${isActive 
          ? 'bg-gray-700 text-white' 
          : 'hover:bg-gray-700 hover:text-gray-200'
        }
      `}
    >
      {/* Avatar with Status */}
      <div className="relative">
        <Avatar
          src={user.avatar}
          name={user.username}
          size="sm"
          status={user.status}
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-baseline">
          <span className="font-medium truncate">{user.username}</span>
          {timeAgo && (
            <span className="text-xs text-gray-500 ml-2">{timeAgo}</span>
          )}
        </div>
        
        {/* Last Message Preview */}
        {lastMessage && (
          <p className="text-sm text-gray-400 truncate">
            {lastMessage.sender === currentUser?._id ? 'You: ' : ''}
            {lastMessage.text}
          </p>
        )}
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  )
}

export default DMItem