import { Outlet } from 'react-router-dom'
import ServerList from '../servers/ServerList'
import ChannelList from '../channels/ChannelList'
import { useServer } from '../../context/ServerContext'

const ServerLayout = () => {
  const { currentServer } = useServer()

  return (
    <div className="flex h-screen">
      {/* Server List Sidebar */}
      <div className="w-20 bg-gray-900 h-full">
        <ServerList />
      </div>

      {/* Channel List Sidebar */}
      {currentServer && (
        <div className="w-60 bg-gray-800 h-full">
          <ChannelList />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export default ServerLayout