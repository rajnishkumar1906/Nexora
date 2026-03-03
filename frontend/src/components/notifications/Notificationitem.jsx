import { formatDistanceToNow } from 'date-fns'
import Avatar from '../ui/Avatar'
import { 
  UserPlus, 
  UserCheck, 
  Gamepad2, 
  MessageCircle, 
  AtSign, 
  Users,
  Trophy,
  Bell
} from 'lucide-react'

const NotificationItem = ({ notification, onClick }) => {
  if (!notification) return null

  const { sender, type, title, message, isRead, createdAt, data } = notification
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  const getIcon = () => {
    const iconProps = { size: 18, className: 'text-gray-600' }
    
    switch (type) {
      case 'friend_request':
        return <UserPlus {...iconProps} className="text-blue-600" />
      case 'friend_request_accepted':
        return <UserCheck {...iconProps} className="text-green-600" />
      case 'game_invite':
        return <Gamepad2 {...iconProps} className="text-purple-600" />
      case 'game_turn':
        return <Gamepad2 {...iconProps} className="text-yellow-600" />
      case 'game_result':
        return <Trophy {...iconProps} className="text-yellow-600" />
      case 'channel_mention':
        return <AtSign {...iconProps} className="text-red-600" />
      case 'server_invite':
        return <Users {...iconProps} className="text-indigo-600" />
      case 'message':
        return <MessageCircle {...iconProps} className="text-blue-600" />
      default:
        return <Bell {...iconProps} />
    }
  }

  const getBackgroundColor = () => {
    if (!isRead) {
      switch (type) {
        case 'friend_request':
        case 'friend_request_accepted':
          return 'bg-blue-50'
        case 'game_invite':
        case 'game_turn':
        case 'game_result':
          return 'bg-purple-50'
        case 'channel_mention':
          return 'bg-red-50'
        case 'server_invite':
          return 'bg-indigo-50'
        default:
          return 'bg-gray-50'
      }
    }
    return 'bg-white'
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors
        border-b border-gray-100 last:border-0 text-left
        ${getBackgroundColor()}
      `}
    >
      {/* Avatar or Icon */}
      <div className="flex-shrink-0">
        {sender ? (
          <Avatar
            src={sender.avatar}
            name={sender.username}
            size="sm"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-medium text-gray-900">
            {title}
          </h4>
          {!isRead && (
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-1">
          {message}
        </p>
        
        <p className="text-xs text-gray-400">
          {timeAgo}
        </p>

        {/* Additional Data */}
        {data?.gameType && (
          <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {data.gameType}
          </span>
        )}
      </div>
    </button>
  )
}

export default NotificationItem