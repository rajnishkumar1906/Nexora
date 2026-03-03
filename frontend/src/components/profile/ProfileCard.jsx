import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { Mail, MapPin, Globe, Calendar, Users, Edit, MessageCircle, UserPlus, UserCheck } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

const ProfileCard = ({ 
  user, 
  profile, 
  isOwnProfile = false,
  friendStatus,
  onSendFriendRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onEdit
}) => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { isOnline } = useSocket()
  const [imageError, setImageError] = useState(false)

  const online = isOnline(user?._id)

  const handleMessage = () => {
    const chatId = [currentUser?._id, user?._id].sort().join('_')
    navigate(`/dm/${chatId}`)
  }

  const renderFriendButton = () => {
    if (isOwnProfile) return null

    switch (friendStatus) {
      case 'friends':
        return (
          <div className="flex space-x-2">
            <Button onClick={handleMessage} icon={<MessageCircle size={18} />}>
              Message
            </Button>
            <Button variant="danger" onClick={onRemoveFriend}>
              Unfriend
            </Button>
          </div>
        )
      
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button onClick={onAcceptRequest} variant="primary">
              Accept
            </Button>
            <Button onClick={onRejectRequest} variant="outline">
              Reject
            </Button>
          </div>
        )
      
      case 'request_sent':
        return (
          <Button variant="outline" disabled>
            Request Sent
          </Button>
        )
      
      case 'request_received':
        return (
          <div className="flex space-x-2">
            <Button onClick={onAcceptRequest} variant="primary">
              Accept
            </Button>
            <Button onClick={onRejectRequest} variant="outline">
              Reject
            </Button>
          </div>
        )
      
      default:
        return (
          <Button onClick={onSendFriendRequest} icon={<UserPlus size={18} />}>
            Add Friend
          </Button>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {profile?.coverImage && !imageError ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        
        {isOwnProfile && (
          <button
            onClick={onEdit}
            className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="Edit Profile"
          >
            <Edit size={18} />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end -mt-12 mb-4">
          <Avatar
            src={user?.avatar}
            name={user?.username}
            size="xl"
            status={online ? 'online' : user?.status}
            className="border-4 border-white"
          />
          
          <div className="ml-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
            <p className="text-gray-600 flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
              {online ? 'Online' : 'Offline'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {renderFriendButton()}
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          {(profile?.firstName || profile?.lastName) && (
            <div className="flex items-center text-gray-600">
              <Users size={18} className="mr-2 text-gray-400" />
              <span>{profile.firstName} {profile.lastName}</span>
            </div>
          )}

          {/* Email */}
          {user?.email && (
            <div className="flex items-center text-gray-600">
              <Mail size={18} className="mr-2 text-gray-400" />
              <a href={`mailto:${user.email}`} className="hover:text-blue-600">
                {user.email}
              </a>
            </div>
          )}

          {/* Location */}
          {(profile?.city || profile?.state) && (
            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-2 text-gray-400" />
              <span>
                {[profile.city, profile.state].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Website */}
          {profile?.website && (
            <div className="flex items-center text-gray-600">
              <Globe size={18} className="mr-2 text-gray-400" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center text-gray-600">
            <Calendar size={18} className="mr-2 text-gray-400" />
            <span>Joined {formatDate(user?.createdAt)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex space-x-8">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {user?.friends?.length || 0}
              </span>
              <span className="text-gray-600 ml-2">Friends</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {user?.servers?.length || 0}
              </span>
              <span className="text-gray-600 ml-2">Servers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard