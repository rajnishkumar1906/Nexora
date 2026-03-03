import { useState, useEffect } from 'react'
import { useParams, Outlet } from 'react-router-dom'
import { useServer } from '../context/ServerContext'
import { serverApi } from '../api/serverApi'
import ChannelList from '../components/channels/ChannelList'
import { showToast } from '../components/ui/Toast'
import { Menu } from 'lucide-react'

const ServerPage = () => {
  const { serverId } = useParams()
  const { setCurrentServer, setCurrentChannel } = useServer()
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    if (serverId) {
      loadServer()
    }

    return () => {
      setCurrentChannel(null)
    }
  }, [serverId])

  const loadServer = async () => {
    try {
      const { data } = await serverApi.getServer(serverId)
      setCurrentServer(data.server)
    } catch (error) {
      showToast.error('Failed to load server')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* Channel Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-60 bg-gray-800 transform transition-transform duration-300
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ChannelList />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export default ServerPage