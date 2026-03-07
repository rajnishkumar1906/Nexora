import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCompass, FiSearch, FiX, FiUsers, FiHash, FiExternalLink, FiGlobe } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Explore = () => {
  const [servers, setServers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Communities', icon: <FiGlobe size={16} /> },
    { id: 'gaming', label: 'Gaming', icon: <FiHash size={16} /> },
    { id: 'education', label: 'Education', icon: <FiHash size={16} /> },
    { id: 'music', label: 'Music', icon: <FiHash size={16} /> },
    { id: 'tech', label: 'Technology', icon: <FiHash size={16} /> },
    { id: 'other', label: 'Other', icon: <FiHash size={16} /> }
  ];

  useEffect(() => {
    fetchServers();
  }, [activeCategory]);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const categoryParam = activeCategory !== 'all' ? `&category=${activeCategory}` : '';
      const { data } = await axios.get(`/api/servers/explore?q=${searchQuery}${categoryParam}`, {
        withCredentials: true
      });
      if (data.success) {
        setServers(data.servers);
      }
    } catch (error) {
      console.error('Fetch servers error:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServers();
  };

  const handleOpenServer = async (serverId) => {
    try {
      const channelsRes = await axios.get(`/api/channels/server/${serverId}`, {
        withCredentials: true
      });
      if (channelsRes.data?.success && channelsRes.data.channels?.length > 0) {
        navigate(`/server/${serverId}/channel/${channelsRes.data.channels[0]._id}`);
        return;
      }
    } catch {
      // ignore and fallback
    }
    navigate(`/server/${serverId}`);
  };

  const handleJoinServer = async (serverId) => {
    try {
      const { data } = await axios.post(`/api/servers/join/${serverId}`, {}, {
        withCredentials: true
      });
      if (data.success) {
        toast.success(`Joined ${data.server.name} successfully!`);
        if (data.defaultChannelId) {
          navigate(`/server/${serverId}/channel/${data.defaultChannelId}`);
          return;
        }
        try {
          const channelsRes = await axios.get(`/api/channels/server/${serverId}`, {
            withCredentials: true
          });
          if (channelsRes.data?.success && channelsRes.data.channels?.length > 0) {
            navigate(`/server/${serverId}/channel/${channelsRes.data.channels[0]._id}`);
            return;
          }
        } catch {
          // fall through to generic navigation
        }
        navigate(`/server/${serverId}`);
      }
    } catch (error) {
      console.error('Join server error:', error);
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  };

  return (
    <div className="flex flex-col h-full glass overflow-hidden text-sharp">
      {/* Top Navbar */}
      <header className="h-12 border-b border-primary-200/70 px-4 flex items-center justify-between glass shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-dark-400 space-x-2 mr-4 border-r border-primary-200 pr-4">
            <FiCompass className="text-xl" />
            <span className="font-bold text-primary-700">Explore</span>
          </div>

          <div className="flex items-center space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeCategory === cat.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-dark-400 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden glass">
        {/* Search Header */}
        <div className="p-8 pb-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-black text-dark-600 mb-4 tracking-tight">Find your community on Nexora</h1>
            <p className="text-dark-400 text-lg">From gaming, to music, to learning, there's a place for you.</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300 group-focus-within:text-primary-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Explore communities..."
              className="w-full bg-white border-2 border-primary-100 rounded-2xl py-4 pl-12 pr-4 text-dark-600 focus:outline-none focus:border-primary-500 shadow-xl shadow-primary-500/5 transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchServers();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-500"
              >
                <FiX size={20} />
              </button>
            )}
          </form>
        </div>

        {/* Server Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
            ) : servers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => (
                  <div 
                    key={server._id} 
                    className="bg-white rounded-[32px] border border-primary-200 overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all group flex flex-col h-full"
                  >
                    {/* Server Banner/Icon */}
                    <div className="h-32 bg-gradient-to-br from-primary-500 to-secondary-600 relative overflow-hidden">
                      {server.icon && (
                        <img 
                          src={server.icon} 
                          alt={server.name} 
                          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-dark-500/20 group-hover:bg-dark-500/10 transition-colors"></div>
                      <div className="absolute bottom-4 left-6 flex items-end space-x-3">
                        <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg border border-primary-100 overflow-hidden">
                          <img 
                            src={server.icon || `https://ui-avatars.com/api/?name=${server.name}&background=8b5cf6&color=fff&bold=true`} 
                            alt={server.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-10 flex flex-col flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-black text-dark-600 group-hover:text-primary-600 transition-colors truncate">
                          {server.name}
                        </h3>
                        <FiExternalLink size={14} className="text-dark-300 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      
                      <p className="text-dark-400 text-sm mb-6 line-clamp-2 flex-1">
                        {server.description || 'No description provided for this community.'}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-bold text-dark-400">
                              {server.memberCount || 1} Members
                            </span>
                          </div>
                          <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full uppercase border border-primary-200">
                            {server.category || 'Other'}
                          </span>
                        </div>
                        {server.isMember ? (
                          <button
                            onClick={() => handleOpenServer(server._id)}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]"
                          >
                            OPEN
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinServer(server._id)}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]"
                          >
                            JOIN
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch size={40} className="text-primary-600" />
                </div>
                <h2 className="text-2xl font-black text-dark-600 mb-2">No communities found</h2>
                <p className="text-dark-400">Try searching for something else or browse different categories.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-6 text-primary-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Explore;
