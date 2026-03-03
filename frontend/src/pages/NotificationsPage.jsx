import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../api/notificationApi'
import NotificationList from '../components/notifications/NotificationList'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await notificationApi.getNotifications()
      setNotifications(data.notifications || [])
    } catch (error) {
      showToast.error('Failed to load notifications')
    } finally {
      setLoading(false)
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
    } catch (error) {
      showToast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      showToast.success('All notifications marked as read')
    } catch (error) {
      showToast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      showToast.success('Notification deleted')
    } catch (error) {
      showToast.error('Failed to delete notification')
    }
  }

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all notifications?')) {
      try {
        await notificationApi.deleteAll()
        setNotifications([])
        showToast.success('All notifications deleted')
      } catch (error) {
        showToast.error('Failed to delete notifications')
      }
    }
  }

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification._id)
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead)
      case 'read':
        return notifications.filter(n => n.isRead)
      default:
        return notifications
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell size={24} className="text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                icon={<CheckCheck size={16} />}
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAll}
                icon={<Trash2 size={16} />}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4 border-b border-gray-200">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'read', label: 'Read' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors relative
                ${filter === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {tab.label}
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <NotificationList
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            onDelete={handleDelete}
          />

          {filteredNotifications.length === 0 && (
            <div className="text-center py-16">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter !== 'all' ? filter : ''} notifications
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'You have no unread notifications'
                  : filter === 'read'
                  ? 'No read notifications yet'
                  : 'When you get notifications, they\'ll appear here'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage