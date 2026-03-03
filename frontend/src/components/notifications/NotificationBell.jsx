import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { notificationApi } from '../../api/notificationApi'
import NotificationList from './NotificationList'
import { showToast } from '../ui/Toast'
import { useSocket } from '../../context/SocketContext'

const NotificationBell = () => {
  const navigate = useNavigate()
  const { socket } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()

    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!socket) return

    // Listen for new notifications
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
      showToast.info(notification.message)
    })

    // Listen for notifications read
    socket.on('notificationsRead', () => {
      setUnreadCount(0)
    })

    return () => {
      socket.off('newNotification')
      socket.off('notificationsRead')
    }
  }, [socket])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await notificationApi.getNotifications()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const { data } = await notificationApi.getUnreadCount()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Failed to load unread count')
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      showToast.success('All notifications marked as read')
    } catch (error) {
      showToast.error('Failed to mark all as read')
    }
  }

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification._id)
    
    // Navigate based on notification type
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    } else {
      switch (notification.type) {
        case 'friend_request':
        case 'friend_request_accepted':
          navigate('/friends')
          break
        case 'game_invite':
        case 'game_turn':
        case 'game_result':
          if (notification.data?.gameId) {
            navigate(`/games/${notification.data.gameId}`)
          }
          break
        case 'channel_mention':
          if (notification.data?.channelId) {
            navigate(`/channels/${notification.data.channelId}`)
          }
          break
        case 'server_invite':
          if (notification.data?.inviteCode) {
            navigate(`/invite/${notification.data.inviteCode}`)
          }
          break
        default:
          // Do nothing
          break
      }
    }
    
    setIsOpen(false)
  }

  const handleViewAll = () => {
    navigate('/notifications')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <NotificationList
            notifications={notifications.slice(0, 5)}
            loading={loading}
            onNotificationClick={handleNotificationClick}
          />

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={handleViewAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell