import React from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { MessageCircle, Gamepad2, MoreVertical, UserMinus } from 'lucide-react'
import Dropdown, { DropdownItem } from '../ui/Dropdown'

const FriendItem = ({ friend, onMessage, onPlay, onRemove }) => {
  if (!friend) return null

  const statusColors = {
    online: 'text-green-500',
    offline: 'text-gray-400',
    away: 'text-yellow-500',
    busy: 'text-red-500',
  }

  const statusText = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    busy: 'Do Not Disturb',
  }

  const trigger = (
    <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
      <MoreVertical size={18} />
    </button>
  )

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
      {/* Left Section - Avatar and Info */}
      <div className="flex items-center space-x-3 flex-1">
        <Avatar
          src={friend.avatar}
          name={friend.username}
          size="md"
          status={friend.status}
        />
        
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-900">{friend.username}</h3>
            <span className={`ml-2 text-xs ${statusColors[friend.status] || 'text-gray-400'}`}>
              • {statusText[friend.status] || 'Offline'}
            </span>
          </div>
          
          {friend.status === 'offline' && friend.lastSeen && (
            <p className="text-xs text-gray-500">
              Last seen {new Date(friend.lastSeen).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMessage}
          icon={<MessageCircle size={16} />}
        >
          Message
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlay}
          icon={<Gamepad2 size={16} />}
        >
          Play
        </Button>
        
        <Dropdown trigger={trigger}>
          <DropdownItem onClick={onRemove} className="text-red-600">
            <UserMinus size={16} className="mr-2" />
            Remove Friend
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  )
}

export default FriendItem