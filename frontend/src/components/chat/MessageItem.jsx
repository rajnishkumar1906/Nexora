import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../ui/Avatar'
import { MoreVertical, Edit2, Trash2, Reply } from 'lucide-react'
import Dropdown, { DropdownItem } from '../ui/Dropdown'

const MessageItem = ({ message, isOwnMessage = false, showAvatar = true }) => {
  const [showActions, setShowActions] = useState(false)

  if (!message) return null

  const { sender, text, createdAt, isEdited, attachments } = message
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  const trigger = (
    <button className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
      <MoreVertical size={16} />
    </button>
  )

  return (
    <div 
      className={`flex group hover:bg-gray-50 px-4 py-1 rounded-lg transition-colors
        ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar ? (
        <div className="flex-shrink-0 mr-3">
          <Avatar
            src={sender?.avatar}
            name={sender?.username}
            size="sm"
          />
        </div>
      ) : (
        <div className="w-10 mr-3" /> /* Spacer for alignment */
      )}

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
        {/* Header with username and time */}
        {showAvatar && (
          <div className={`flex items-baseline mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="font-medium text-gray-900 mr-2">
              {sender?.username || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500" title={new Date(createdAt).toLocaleString()}>
              {timeAgo}
            </span>
            {isEdited && (
              <span className="text-xs text-gray-400 ml-2">(edited)</span>
            )}
          </div>
        )}

        {/* Message Text */}
        <div className={`relative group/message ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} 
          rounded-lg px-4 py-2 inline-block max-w-full`}>
          <p className="whitespace-pre-wrap break-words">{text}</p>

          {/* Message Actions Dropdown */}
          {showActions && (
            <div className={`absolute ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} 
              top-0 opacity-0 group-hover/message:opacity-100 transition-opacity`}>
              <Dropdown trigger={trigger}>
                <DropdownItem onClick={() => {}}>
                  <Reply size={16} className="mr-2" />
                  Reply
                </DropdownItem>
                {isOwnMessage && (
                  <>
                    <DropdownItem onClick={() => {}}>
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </DropdownItem>
                    <DropdownItem onClick={() => {}} className="text-red-600">
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            </div>
          )}
        </div>

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachments.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="Attachment"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageItem