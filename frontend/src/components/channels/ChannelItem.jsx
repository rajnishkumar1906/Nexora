import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Hash, Volume2, Settings, Trash2 } from 'lucide-react'
import { channelApi } from '../../api/channelApi'
import { showToast } from '../ui/Toast'
import Dropdown, { DropdownItem } from '../ui/Dropdown'

const ChannelItem = ({ channel, type = 'text' }) => {
  const navigate = useNavigate()
  const { serverId, channelId } = useParams()
  const [showSettings, setShowSettings] = useState(false)
  const isActive = channelId === channel._id

  const handleClick = () => {
    navigate(`/servers/${serverId}/channels/${channel._id}`)
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete #${channel.name} channel?`)) {
      try {
        await channelApi.deleteChannel(channel._id)
        showToast.success('Channel deleted')
        if (isActive) {
          navigate(`/servers/${serverId}`)
        }
      } catch (error) {
        showToast.error('Failed to delete channel')
      }
    }
  }

  const Icon = type === 'text' ? Hash : Volume2

  const trigger = (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center px-2 py-1 rounded-lg group
        ${isActive 
          ? 'bg-gray-700 text-white' 
          : 'hover:bg-gray-700 hover:text-gray-200'
        }
      `}
    >
      <Icon size={18} className="mr-2 text-gray-400" />
      <span className="flex-1 text-left truncate">{channel.name}</span>
      <div className="hidden group-hover:flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowSettings(true)
          }}
          className="p-1 hover:bg-gray-600 rounded"
        >
          <Settings size={14} />
        </button>
      </div>
    </button>
  )

  return (
    <>
      <Dropdown trigger={trigger}>
        <DropdownItem onClick={() => setShowSettings(true)}>
          <Settings size={16} className="mr-2" />
          Channel Settings
        </DropdownItem>
        <DropdownItem onClick={handleDelete} className="text-red-600">
          <Trash2 size={16} className="mr-2" />
          Delete Channel
        </DropdownItem>
      </Dropdown>

      {/* Settings Modal would go here */}
    </>
  )
}

export default ChannelItem