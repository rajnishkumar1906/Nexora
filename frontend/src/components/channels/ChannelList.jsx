import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useServer } from '../../context/ServerContext'
import { channelApi } from '../../api/channelApi'
import ChannelItem from './ChannelItem'
import CreateChannelModal from './CreateChannelModal'
import { Plus, Hash, Volume2 } from 'lucide-react'
import { showToast } from '../ui/Toast'

const ChannelList = () => {
  const { serverId } = useParams()
  const { currentServer, channels, setChannels } = useServer()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (serverId) {
      loadChannels()
    }
  }, [serverId])

  const loadChannels = async () => {
    try {
      setLoading(true)
      const { data } = await channelApi.getChannels(serverId)
      setChannels(data.channels || [])
    } catch (error) {
      showToast.error('Failed to load channels')
    } finally {
      setLoading(false)
    }
  }

  const textChannels = channels.filter(ch => ch.type === 'text')
  const voiceChannels = channels.filter(ch => ch.type === 'voice')

  if (loading) {
    return (
      <div className="h-full bg-gray-800 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-800 text-gray-300 flex flex-col">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-white truncate">
          {currentServer?.name || 'Server'}
        </h2>
      </div>

      {/* Channels Container */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Text Channels */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Text Channels
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Create Channel"
            >
              <Plus size={14} />
            </button>
          </div>
          
          {textChannels.length > 0 ? (
            textChannels.map(channel => (
              <ChannelItem key={channel._id} channel={channel} type="text" />
            ))
          ) : (
            <p className="text-xs text-gray-500 italic px-2">No text channels</p>
          )}
        </div>

        {/* Voice Channels */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Voice Channels
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Create Channel"
            >
              <Plus size={14} />
            </button>
          </div>
          
          {voiceChannels.length > 0 ? (
            voiceChannels.map(channel => (
              <ChannelItem key={channel._id} channel={channel} type="voice" />
            ))
          ) : (
            <p className="text-xs text-gray-500 italic px-2">No voice channels</p>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        serverId={serverId}
        onChannelCreated={loadChannels}
      />
    </div>
  )
}

export default ChannelList