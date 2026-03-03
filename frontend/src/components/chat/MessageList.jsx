import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import TypingIndicator from './TypingIndicator'

const MessageList = ({ messages = [], typingUsers = [], currentUser }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Be the first to send a message!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => {
        const showAvatar = index === 0 || 
          messages[index - 1]?.sender?._id !== message.sender?._id

        return (
          <MessageItem
            key={message._id || index}
            message={message}
            isOwnMessage={message.sender?._id === currentUser?._id}
            showAvatar={showAvatar}
          />
        )
      })}
      
      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList