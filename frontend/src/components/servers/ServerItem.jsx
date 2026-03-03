import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import { MoreVertical, Settings, UserPlus, LogOut, Trash2 } from 'lucide-react'
import { serverApi } from '../../api/serverApi'
import { showToast } from '../ui/Toast'

const ServerItem = ({ server, isActive, onClick }) => {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)

  const handleSettings = () => {
    navigate(`/servers/${server._id}/settings`)
  }

  const handleInvite = () => {
    // Copy invite link
    const inviteLink = `${window.location.origin}/invite/${server.inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    showToast.success('Invite link copied!')
  }

  const handleLeave = async () => {
    if (window.confirm(`Leave ${server.name}?`)) {
      try {
        await serverApi.leaveServer(server._id)
        showToast.success(`Left ${server.name}`)
        navigate('/dashboard')
      } catch (error) {
        showToast.error('Failed to leave server')
      }
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete ${server.name}? This cannot be undone.`)) {
      try {
        await serverApi.deleteServer(server._id)
        showToast.success('Server deleted')
        navigate('/dashboard')
      } catch (error) {
        showToast.error('Failed to delete server')
      }
    }
  }

  const trigger = (
    <button className="p-1 hover:bg-gray-700 rounded-full transition-colors">
      <MoreVertical size={16} className="text-gray-400" />
    </button>
  )

  return (
    <div className="relative group">
      {/* Server Icon */}
      <button
        onClick={onClick}
        className={`
          w-12 h-12 rounded-full overflow-hidden transition-all relative
          ${isActive 
            ? 'rounded-xl bg-blue-600' 
            : 'hover:rounded-xl bg-gray-700'
          }
        `}
        title={server.name}
      >
        {server.icon && !imageError ? (
          <img
            src={server.icon}
            alt={server.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full" />
        )}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute left-14 top-0 hidden group-hover:block">
        <Dropdown trigger={trigger}>
          <DropdownItem onClick={handleSettings}>
            <Settings size={16} className="mr-2" />
            Server Settings
          </DropdownItem>
          <DropdownItem onClick={handleInvite}>
            <UserPlus size={16} className="mr-2" />
            Invite People
          </DropdownItem>
          <DropdownItem onClick={handleLeave} className="text-yellow-600">
            <LogOut size={16} className="mr-2" />
            Leave Server
          </DropdownItem>
          {server.role === 'owner' && (
            <DropdownItem onClick={handleDelete} className="text-red-600">
              <Trash2 size={16} className="mr-2" />
              Delete Server
            </DropdownItem>
          )}
        </Dropdown>
      </div>
    </div>
  )
}

export default ServerItem