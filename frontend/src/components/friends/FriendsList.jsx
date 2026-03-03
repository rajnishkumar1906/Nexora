import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FriendItem from './FriendItem'
import FriendRequests from './FriendRequests'
import AddFriendModal from './AddFriendModal'
import { friendApi } from '../../api/friendApi'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { showToast } from '../ui/Toast'
import { Users, UserPlus, Clock, UserCheck, MessageCircle, Gamepad2 } from 'lucide-react'
import Button from '../ui/Button'

const FriendsList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { onlineUsers } = useSocket()
  const [activeTab, setActiveTab] = useState('online')
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const tabs = [
    { id: 'online', label: 'Online', icon: Users },
    { id: 'all', label: 'All Friends', icon: Users },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'requests', label: 'Requests', icon: UserCheck },
  ]

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const { data } = await friendApi.getFriends()
      setFriends(data.friends || [])
    } catch (error) {
      showToast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredFriends = () => {
    switch (activeTab) {
      case 'online':
        return friends.filter(f => onlineUsers.includes(f._id))
      case 'all':
        return friends
      default:
        return []
    }
  }

  const handleRemoveFriend = async (friendId) => {
    try {
      await friendApi.removeFriend(friendId)
      setFriends(friends.filter(f => f._id !== friendId))
      showToast.success('Friend removed')
    } catch (error) {
      showToast.error('Failed to remove friend')
    }
  }

  const handleMessage = (friendId) => {
    const chatId = [user?._id, friendId].sort().join('_')
    navigate(`/dm/${chatId}`)
  }

  const handlePlayGame = (friendId) => {
    // Navigate to game invite or create game
    navigate('/games')
  }

  const filteredFriends = getFilteredFriends()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<UserPlus size={18} />}
          >
            Add Friend
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.id === 'pending' && (
                  <span className="ml-1 text-xs bg-yellow-500 text-white px-1.5 rounded-full">3</span>
                )}
                {tab.id === 'requests' && (
                  <span className="ml-1 text-xs bg-red-500 text-white px-1.5 rounded-full">2</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'pending' ? (
          <FriendRequests type="sent" onUpdate={loadFriends} />
        ) : activeTab === 'requests' ? (
          <FriendRequests type="received" onUpdate={loadFriends} />
        ) : (
          <>
            {filteredFriends.length > 0 ? (
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <FriendItem
                    key={friend._id}
                    friend={friend}
                    onMessage={() => handleMessage(friend._id)}
                    onPlay={() => handlePlayGame(friend._id)}
                    onRemove={() => handleRemoveFriend(friend._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No friends {activeTab === 'online' ? 'online' : 'yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'online' 
                    ? 'Your friends will appear here when they come online'
                    : 'Add friends to start chatting and playing games'
                  }
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  Add Friend
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onFriendAdded={loadFriends}
      />
    </div>
  )
}

export default FriendsList