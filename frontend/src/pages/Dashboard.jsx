import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { serverApi } from '../api/serverApi'
import Button from '../components/ui/Button'
import CreateServerModal from '../components/servers/CreateServerModal'
import { showToast } from '../components/ui/Toast'
import { 
  Plus, 
  Compass, 
  Users, 
  Gamepad2, 
  Loader,
  MessageCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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
    navigate(`/servers/${server._id}`)
  }

  const handleServerCreated = (newServer) => {
    loadServers() // Reload the servers list
    showToast.success(`✨ Welcome to ${newServer.name}!`)
    navigate(`/servers/${newServer._id}`)
  }

  // Get random gradient for server cards without icons
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.username}</span>!
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your communities today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{servers.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Your Servers</h3>
            <p className="text-sm text-gray-500">Active communities</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="font-semibold text-gray-900">Friends Online</h3>
            <p className="text-sm text-gray-500">Connected now</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle size={24} className="text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">12</span>
            </div>
            <h3 className="font-semibold text-gray-900">New Messages</h3>
            <p className="text-sm text-gray-500">Unread conversations</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Gamepad2 size={24} className="text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">3</span>
            </div>
            <h3 className="font-semibold text-gray-900">Games Played</h3>
            <p className="text-sm text-gray-500">This week</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/discover')}
            className="group relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <Compass className="w-8 h-8 text-blue-600 group-hover:text-white mb-3 transition-colors" />
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Discover Servers</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors mt-1">Find new communities</p>
            </div>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <Plus className="w-8 h-8 text-green-600 group-hover:text-white mb-3 transition-colors" />
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Create Server</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors mt-1">Start your community</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/friends')}
            className="group relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <Users className="w-8 h-8 text-purple-600 group-hover:text-white mb-3 transition-colors" />
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Find Friends</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors mt-1">Connect with others</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dm')}
            className="group relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <MessageCircle className="w-8 h-8 text-orange-600 group-hover:text-white mb-3 transition-colors" />
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Messages</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors mt-1">Check your DMs</p>
            </div>
          </button>
        </div>

        {/* Your Servers Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Servers</h2>
            {servers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/discover')}
                icon={<Compass size={16} />}
              >
                Discover More
              </Button>
            )}
          </div>

          {servers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servers.map((server, index) => (
                <button
                  key={server._id}
                  onClick={() => handleServerClick(server)}
                  className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4">
                      {server.icon ? (
                        <img
                          src={server.icon}
                          alt={server.name}
                          className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-md"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                          {server.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {server.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {server.memberCount || 1} {server.memberCount === 1 ? 'member' : 'members'}
                        </p>
                        {server.category && (
                          <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            {server.category}
                          </span>
                        )}
                      </div>
                      <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    {server.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2 border-t border-gray-200 pt-3">
                        {server.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles size={32} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No servers yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first server to start building your community!
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus size={18} />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Server
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/discover')}
                  icon={<Compass size={18} />}
                >
                  Discover Servers
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Server Modal */}
      <CreateServerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onServerCreated={handleServerCreated}
      />
    </div>
  )
}

export default Dashboard