import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import { serverApi } from '../../api/serverApi'
import { showToast } from '../ui/Toast'
import { MoreVertical, Crown, Shield, User, UserMinus, UserCog } from 'lucide-react'

const ServerMembersList = ({ isOpen, onClose }) => {
  const { serverId } = useParams()
  const { user: currentUser } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState('')

  useEffect(() => {
    if (isOpen && serverId) {
      loadMembers()
    }
  }, [isOpen, serverId])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const { data } = await serverApi.getMembers(serverId)
      setMembers(data.members || [])
      
      // Find current user's role
      const currentMember = data.members.find(m => m.user?._id === currentUser?._id)
      setCurrentUserRole(currentMember?.role || '')
    } catch (error) {
      showToast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await serverApi.updateMemberRole(serverId, memberId, newRole)
      showToast.success('Role updated')
      loadMembers()
    } catch (error) {
      showToast.error('Failed to update role')
    }
  }

  const handleKick = async (memberId) => {
    // This would need a kick endpoint
    showToast.info('Kick feature coming soon')
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown size={14} className="text-yellow-500" />
      case 'admin':
        return <Shield size={14} className="text-blue-500" />
      default:
        return <User size={14} className="text-gray-400" />
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canManageMember = (memberRole) => {
    if (currentUserRole === 'owner') return true
    if (currentUserRole === 'admin' && memberRole !== 'owner' && memberRole !== 'admin') return true
    return false
  }

  const onlineMembers = members.filter(m => m.user?.status === 'online')
  const offlineMembers = members.filter(m => m.user?.status !== 'online')

  const trigger = (member) => (
    <button className="p-1 hover:bg-gray-700 rounded-full transition-colors">
      <MoreVertical size={14} className="text-gray-400" />
    </button>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-end min-h-screen">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        {/* Members Panel */}
        <div className="relative bg-gray-800 w-80 h-screen overflow-y-auto ml-auto">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Members</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {members.length} members
            </p>
          </div>

          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
              </div>
            ) : (
              <>
                {/* Online Members */}
                {onlineMembers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Online — {onlineMembers.length}
                    </h3>
                    <div className="space-y-1">
                      {onlineMembers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg group"
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar
                              src={member.user?.avatar}
                              name={member.user?.username}
                              size="sm"
                              status="online"
                            />
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-white">
                                  {member.user?.username}
                                </span>
                                <span className="ml-2">
                                  {getRoleIcon(member.role)}
                                </span>
                              </div>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadgeColor(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                          </div>

                          {canManageMember(member.role) && (
                            <Dropdown trigger={trigger(member)}>
                              <DropdownItem onClick={() => handleRoleChange(member._id, 'admin')}>
                                <UserCog size={14} className="mr-2" />
                                Make Admin
                              </DropdownItem>
                              <DropdownItem onClick={() => handleRoleChange(member._id, 'member')}>
                                <User size={14} className="mr-2" />
                                Make Member
                              </DropdownItem>
                              <DropdownItem onClick={() => handleKick(member._id)} className="text-red-600">
                                <UserMinus size={14} className="mr-2" />
                                Kick Member
                              </DropdownItem>
                            </Dropdown>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline Members */}
                {offlineMembers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Offline — {offlineMembers.length}
                    </h3>
                    <div className="space-y-1">
                      {offlineMembers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg group"
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar
                              src={member.user?.avatar}
                              name={member.user?.username}
                              size="sm"
                              status="offline"
                            />
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-400">
                                  {member.user?.username}
                                </span>
                                <span className="ml-2">
                                  {getRoleIcon(member.role)}
                                </span>
                              </div>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadgeColor(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerMembersList