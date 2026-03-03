import { useState, useEffect } from 'react'
import { friendApi } from '../../api/friendApi'
import FriendItem from './FriendItem'
import { showToast } from '../ui/Toast'
import { UserPlus, Loader } from 'lucide-react'

const FriendRequests = ({ incoming = true, onRequestHandled }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [incoming])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const endpoint = incoming ? 'getFriendRequests' : 'getSentRequests'
      const { data } = await friendApi[endpoint]()
      setRequests(data.requests || [])
    } catch (error) {
      showToast.error(`Failed to load ${incoming ? 'incoming' : 'sent'} requests`)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      await friendApi.acceptRequest(requestId)
      showToast.success('Friend request accepted')
      loadRequests()
      onRequestHandled?.()
    } catch (error) {
      showToast.error('Failed to accept request')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await friendApi.rejectRequest(requestId)
      showToast.success('Friend request rejected')
      loadRequests()
      onRequestHandled?.()
    } catch (error) {
      showToast.error('Failed to reject request')
    }
  }

  const handleCancel = async (requestId) => {
    try {
      await friendApi.cancelRequest(requestId)
      showToast.success('Friend request cancelled')
      loadRequests()
    } catch (error) {
      showToast.error('Failed to cancel request')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader size={24} className="animate-spin text-blue-600 mx-auto" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No {incoming ? 'incoming' : 'sent'} requests
        </h3>
        <p className="text-gray-500">
          {incoming 
            ? 'When someone sends you a friend request, it will appear here'
            : 'Requests you send will appear here'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <FriendItem
          key={request._id}
          friend={incoming ? request.sender : request.recipient}
          showActions={false}
          onAccept={incoming ? () => handleAccept(request._id) : null}
          onReject={incoming ? () => handleReject(request._id) : null}
          onCancel={!incoming ? () => handleCancel(request._id) : null}
        />
      ))}
    </div>
  )
}

export default FriendRequests