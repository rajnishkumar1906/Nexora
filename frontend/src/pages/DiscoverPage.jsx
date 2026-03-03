import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverApi } from '../api/serverApi'
import { showToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import { Search, Users, Globe, Hash, Loader } from 'lucide-react'

const DiscoverPage = () => {
  const navigate = useNavigate()
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [joinedServers, setJoinedServers] = useState(new Set())

  const categories = [
    'all',
    'Gaming',
    'Study',
    'Music',
    'Tech',
    'Art',
    'Sports',
    'Social',
    'Other'
  ]

  useEffect(() => {
    loadServers()
    loadJoinedServers()
  }, [])

  const loadServers = async () => {
    try {
      setLoading(true)
      const { data } = await serverApi.discoverServers()
      setServers(data.servers || [])
    } catch (error) {
      showToast.error('Failed to load servers')
    } finally {
      setLoading(false)
    }
  }

  const loadJoinedServers = async () => {
    try {
      const { data } = await serverApi.getMyServers()
      const joined = new Set(data.servers?.map(s => s._id) || [])
      setJoinedServers(joined)
    } catch (error) {
      console.error('Failed to load joined servers')
    }
  }

  const handleJoinServer = async (serverId) => {
    try {
      await serverApi.joinServer(serverId)
      setJoinedServers(prev => new Set([...prev, serverId]))
      showToast.success('Joined server!')
    } catch (error) {
      showToast.error('Failed to join server')
    }
  }

  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         server.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === 'all' || server.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Servers</h1>
          <p className="text-gray-600 mt-2">
            Find communities that match your interests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Servers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader size={32} className="animate-spin text-blue-600 mx-auto" />
          </div>
        ) : (
          <>
            {filteredServers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServers.map((server) => (
                  <div
                    key={server._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Server Icon/Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                      {server.icon ? (
                        <img
                          src={server.icon}
                          alt={server.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl text-white font-bold">
                            {server.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Server Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{server.name}</h3>
                      
                      {server.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {server.description}
                        </p>
                      )}

                      {/* Server Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Users size={16} className="mr-1" />
                          <span>{server.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center">
                          <Hash size={16} className="mr-1" />
                          <span>{server.category}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe size={16} className="mr-1" />
                          <span>{server.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <p className="text-xs text-gray-400 mb-4">
                        Created by {server.owner?.username}
                      </p>

                      {/* Join Button */}
                      {joinedServers.has(server._id) ? (
                        <Button
                          variant="outline"
                          fullWidth
                          disabled
                        >
                          Already Joined
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleJoinServer(server._id)}
                          fullWidth
                        >
                          Join Server
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No servers found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No servers match "${searchQuery}"`
                    : 'There are no servers in this category yet'
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DiscoverPage