import { useState, useEffect } from 'react'
import { friendApi } from '../api/friendApi'
import { showToast } from '../components/ui/Toast'
import { useSocket } from './useSocket'

export const useFriends = () => {
  const { socket, onlineUsers } = useSocket()
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFriends()
    loadFriendRequests()
    loadSentRequests()

    if (socket) {
      socket.on('friendRequestReceived', handleNewRequest)
      socket.on('friendRequestAccepted', handleRequestAccepted)

      return () => {
        socket.off('friendRequestReceived')
        socket.off('friendRequestAccepted')
      }
    }
  }, [socket])

  const loadFriends = async () => {
    try {
      const { data } = await friendApi.getFriends()
      setFriends(data.friends || [])
    } catch (error) {
      showToast.error('Failed to load friends')
    }
  }

  const loadFriendRequests = async () => {
    try {
      const { data } = await friendApi.getFriendRequests()
      setFriendRequests(data.requests || [])
    } catch (error) {
      console.error('Failed to load friend requests')
    }
  }

  const loadSentRequests = async () => {
    try {
      const { data } = await friendApi.getSentRequests()
      setSentRequests(data.requests || [])
    } catch (error) {
      console.error('Failed to load sent requests')
    } finally {
      setLoading(false)
    }
  }

  const handleNewRequest = (data) => {
    setFriendRequests(prev => [...prev, data.request])
    showToast.info(`Friend request from ${data.from.username}`)
  }

  const handleRequestAccepted = (data) => {
    setSentRequests(prev => prev.filter(r => r._id !== data.requestId))
    loadFriends()
    showToast.success(`${data.username} accepted your friend request`)
  }

  const sendRequest = async (userId) => {
    try {
      await friendApi.sendRequest(userId)
      await loadSentRequests()
      showToast.success('Friend request sent')
      return true
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to send request')
      return false
    }
  }

  const acceptRequest = async (requestId) => {
    try {
      await friendApi.acceptRequest(requestId)
      setFriendRequests(prev => prev.filter(r => r._id !== requestId))
      await loadFriends()
      showToast.success('Friend request accepted')
      return true
    } catch (error) {
      showToast.error('Failed to accept request')
      return false
    }
  }

  const rejectRequest = async (requestId) => {
    try {
      await friendApi.rejectRequest(requestId)
      setFriendRequests(prev => prev.filter(r => r._id !== requestId))
      showToast.success('Friend request rejected')
      return true
    } catch (error) {
      showToast.error('Failed to reject request')
      return false
    }
  }

  const cancelRequest = async (requestId) => {
    try {
      await friendApi.cancelRequest(requestId)
      setSentRequests(prev => prev.filter(r => r._id !== requestId))
      showToast.success('Friend request cancelled')
      return true
    } catch (error) {
      showToast.error('Failed to cancel request')
      return false
    }
  }

  const removeFriend = async (friendId) => {
    try {
      await friendApi.removeFriend(friendId)
      setFriends(prev => prev.filter(f => f._id !== friendId))
      showToast.success('Friend removed')
      return true
    } catch (error) {
      showToast.error('Failed to remove friend')
      return false
    }
  }

  const onlineFriends = friends.filter(f => onlineUsers.includes(f._id))
  const offlineFriends = friends.filter(f => !onlineUsers.includes(f._id))

  return {
    friends,
    onlineFriends,
    offlineFriends,
    friendRequests,
    sentRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
    refresh: loadFriends,
  }
}