import NotificationItem from './NotificationItem'
import { Bell } from 'lucide-react'

const NotificationList = ({ 
  notifications = [], 
  loading = false, 
  onNotificationClick,
  showViewAll = false,
  onViewAll
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 mb-1">No notifications</p>
        <p className="text-sm text-gray-400">
          When you get notifications, they'll appear here
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onClick={() => onNotificationClick?.(notification)}
        />
      ))}

      {showViewAll && (
        <button
          onClick={onViewAll}
          className="w-full p-3 text-center text-sm text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
        >
          View all notifications
        </button>
      )}
    </div>
  )
}

export default NotificationList