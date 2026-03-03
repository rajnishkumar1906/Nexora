import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api/userApi'
import { friendApi } from '../api/friendApi'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'
import { 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Users, 
  Edit2, 
  MessageCircle, 
  UserPlus, 
  UserCheck,
  Settings,
  Shield,
  Award,
  Github,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  MoreHorizontal,
  Image as ImageIcon,
  Camera
} from 'lucide-react'

const ProfilePage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFriend, setIsFriend] = useState(false)

  const profileUserId = userId || currentUser?._id
  const isOwnProfile = !userId || userId === currentUser?._id

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (profileUserId) {
      loadProfileData()
    }
  }, [profileUserId, currentUser])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      if (isOwnProfile && currentUser) {
        setUserData(currentUser)
        try {
          const profileRes = await userApi.getProfileByUserId(currentUser._id)
          setProfile(profileRes.data.profile || {})
        } catch (error) {
          setProfile({})
        }
      } else {
        const userRes = await userApi.getUserById(profileUserId)
        setUserData(userRes.data.user)
        try {
          const profileRes = await userApi.getProfileByUserId(profileUserId)
          setProfile(profileRes.data.profile || {})
        } catch (error) {
          setProfile({})
        }
      }
    } catch (error) {
      showToast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Friends', value: userData?.friends?.length || 0, icon: Users },
    { label: 'Servers', value: userData?.servers?.length || 0, icon: Shield },
    { label: 'Messages', value: '2.3k', icon: MessageCircle },
    { label: 'Games Played', value: '156', icon: Award },
  ]

  const socialLinks = [
    { platform: 'GitHub', icon: Github, url: profile?.github, color: 'hover:text-gray-900' },
    { platform: 'Twitter', icon: Twitter, url: profile?.twitter, color: 'hover:text-blue-400' },
    { platform: 'LinkedIn', icon: Linkedin, url: profile?.linkedin, color: 'hover:text-blue-600' },
    { platform: 'Website', icon: Globe, url: profile?.website, color: 'hover:text-purple-600' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')} size="lg">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cover Image Section */}
      <div className="relative h-64 md:h-80 lg:h-96">
        {profile?.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        {/* Edit Cover Button */}
        {isOwnProfile && (
          <button
            className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center space-x-2 border border-white/30"
          >
            <Camera size={18} />
            <span>Change Cover</span>
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative -mt-20">
                <Avatar
                  src={userData.avatar}
                  name={userData.username}
                  size="xl"
                  status={userData.status}
                  className="border-4 border-white shadow-xl"
                />
                {isOwnProfile && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera size={16} />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {userData.username}
                    </h1>
                    {profile?.firstName && profile?.lastName && (
                      <p className="text-lg text-gray-600 mt-1">
                        {profile.firstName} {profile.lastName}
                      </p>
                    )}
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="flex items-center text-gray-600">
                        <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                          userData.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        {userData.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                      {profile?.location && (
                        <span className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-1" />
                          {profile.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {!isOwnProfile ? (
                      <>
                        <Button
                          variant={isFriend ? 'outline' : 'primary'}
                          onClick={() => {/* Handle friend action */}}
                          icon={isFriend ? <UserCheck size={18} /> : <UserPlus size={18} />}
                        >
                          {isFriend ? 'Friends' : 'Add Friend'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {/* Handle message */}}
                          icon={<MessageCircle size={18} />}
                        >
                          Message
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {/* Edit profile */}}
                          icon={<Edit2 size={18} />}
                        >
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/settings')}
                          icon={<Settings size={18} />}
                        >
                          Settings
                        </Button>
                      </>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-8 py-6 bg-gray-50 border-t border-b border-gray-200">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon size={24} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6 md:px-8 space-x-8">
              {['about', 'posts', 'friends', 'servers', 'games'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                    ${activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                {profile?.bio ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700 text-lg leading-relaxed">{profile.bio}</p>
                  </div>
                ) : isOwnProfile ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-gray-500 mb-3">You haven't added a bio yet</p>
                    <Button variant="outline" size="sm">Add Bio</Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-gray-500">This user hasn't added a bio</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Details</h3>
                    
                    {profile?.email && (
                      <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Mail size={18} className="mr-3 text-blue-600" />
                        <a href={`mailto:${profile.email}`} className="hover:text-blue-600">
                          {profile.email}
                        </a>
                      </div>
                    )}

                    {profile?.location && (
                      <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <MapPin size={18} className="mr-3 text-blue-600" />
                        <span>{profile.location}</span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <Calendar size={18} className="mr-3 text-blue-600" />
                      <span>Joined {new Date(userData.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Social Links</h3>
                    
                    {socialLinks.map((link, index) => {
                      const Icon = link.icon
                      if (!link.url) return null
                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors ${link.color}`}
                        >
                          <Icon size={18} className="mr-3" />
                          <span>{link.platform}</span>
                        </a>
                      )
                    })}

                    {profile?.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors hover:text-purple-600"
                      >
                        <LinkIcon size={18} className="mr-3" />
                        <span>Personal Website</span>
                      </a>
                    )}

                    {!profile?.github && !profile?.twitter && !profile?.linkedin && !profile?.website && (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No social links added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">When this user posts, they'll appear here</p>
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No friends to show</h3>
                <p className="text-gray-500">Connect with others to build your network</p>
              </div>
            )}

            {activeTab === 'servers' && (
              <div className="text-center py-12">
                <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No servers joined</h3>
                <p className="text-gray-500">Join servers to start chatting with communities</p>
              </div>
            )}

            {activeTab === 'games' && (
              <div className="text-center py-12">
                <Award size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No games played</h3>
                <p className="text-gray-500">Play games to see your stats here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage