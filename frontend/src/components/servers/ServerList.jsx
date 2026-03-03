import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServer } from '../../context/ServerContext'
import { serverApi } from '../../api/serverApi'
import ServerItem from './ServerItem'
import CreateServerModal from './CreateServerModal'
import JoinServerModal from './JoinServerModal'
import { Plus, Compass, Home } from 'lucide-react'
import { showToast } from '../ui/Toast'

const ServerList = () => {
  const navigate = useNavigate()
  const { serverId } = useParams()
  const { servers, setServers, setCurrentServer } = useServer()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      setLoading(true)
      const { data } = await serverApi.getMyServers()
      setServers(data.servers || [])
    } catch (error) {
      showToast.error('Failed to load servers')
    } finally {
      setLoading(false)
    }
  }

  const handleServerClick = (server) => {
    setCurrentServer(server)
    navigate(`/servers/${server._id}`)
  }

  const handleHomeClick = () => {
    setCurrentServer(null)
    navigate('/dashboard')
  }

  const handleDiscoverClick = () => {
    navigate('/discover')
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col items-center py-3 space-y-2 overflow-y-auto">
      {/* Home/DM Button */}
      <button
        onClick={handleHomeClick}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-all
          ${!serverId 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }
        `}
        title="Home"
      >
        <Home size={20} />
      </button>

      {/* Discover Button */}
      <button
        onClick={handleDiscoverClick}
        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-all"
        title="Discover Servers"
      >
        <Compass size={20} />
      </button>

      {/* Separator */}
      <div className="w-8 h-0.5 bg-gray-700 rounded-full my-2" />

      {/* Server List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {servers.map((server) => (
            <ServerItem
              key={server._id}
              server={server}
              isActive={serverId === server._id}
              onClick={() => handleServerClick(server)}
            />
          ))}
        </>
      )}

      {/* Separator */}
      {servers.length > 0 && (
        <div className="w-8 h-0.5 bg-gray-700 rounded-full my-2" />
      )}

      {/* Create Server Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-green-500 hover:bg-green-600 hover:text-white transition-all group"
        title="Create Server"
      >
        <Plus size={20} />
      </button>

      {/* Join Server Button */}
      <button
        onClick={() => setShowJoinModal(true)}
        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
        title="Join Server"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>

      {/* Modals */}
      <CreateServerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onServerCreated={loadServers}
      />

      <JoinServerModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onServerJoined={(server) => {
          loadServers()
          handleServerClick(server)
        }}
      />
    </div>
  )
}

export default ServerList