import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiMessageCircle, FiCompass, FiLogOut, FiX, FiUpload, FiHash, FiUsers } from 'react-icons/fi';
import { useNexora } from '../context/NexoraContext';
import toast from 'react-hot-toast';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

const Sidebar = () => {
  const { user, logout } = useNexora();
  const [servers, setServers] = useState([]);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newServer, setNewServer] = useState({
    name: '',
    description: '',
    isPublic: true,
    category: 'other',
    icon: null
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user's servers
  const fetchServers = async () => {
    if (!user) return;
    
    try {
      const { data } = await api.get('/api/servers/my');
      if (data.success) {
        setServers(data.servers || []);
      }
    } catch (error) {
      console.error('Fetch servers error:', error);
      // Don't show error toast on initial load if no servers
    }
  };

  useEffect(() => {
    if (user) {
      fetchServers();
    }
  }, [user, fetchServers]);

  // Handle server creation
  const handleCreateServer = async (e) => {
    e.preventDefault();
    
    if (!newServer.name.trim()) {
      toast.error('Please enter a server name');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', newServer.name.trim());
      if (newServer.description) formData.append('description', newServer.description.trim());
      formData.append('isPublic', newServer.isPublic);
      formData.append('category', newServer.category);
      if (newServer.icon) {
        formData.append('icon', newServer.icon);
      }

      const { data } = await api.post('/api/servers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        const createdServer = data.server;
        setServers(prev => [createdServer, ...prev]);
        resetCreateServerModal();
        setShowCreateServer(false);
        toast.success(`Server "${createdServer.name}" created successfully!`);
        navigate(`/server/${createdServer._id}`);
      }
    } catch (error) {
      console.error('Create server error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check if backend is running on port 5000');
      } else if (error.response?.status === 401) {
        toast.error('Please login to create a server');
        navigate('/login');
      } else if (error.response?.status === 413) {
        toast.error('Image file too large. Maximum size is 10MB');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create server');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setNewServer({ ...newServer, icon: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset create server modal
  const resetCreateServerModal = () => {
    setNewServer({
      name: '',
      description: '',
      isPublic: true,
      category: 'other',
      icon: null
    });
    setImagePreview(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  // Check if current path is a server
  const isServerActive = (serverId) => {
    return location.pathname.startsWith(`/server/${serverId}`);
  };

  return (
    <>
      <div className="w-[72px] glass flex flex-col items-center py-3 space-y-3 border-r border-primary-200/60 relative z-50 shadow-sm h-screen overflow-y-auto no-scrollbar text-sharp">
        {/* Home / DMs */}
        <NavLink
          to="/"
          className={({ isActive }) => `
            group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-2xl transition-all duration-300
            ${isActive 
              ? 'bg-primary-500 rounded-2xl text-white shadow-lg shadow-primary-500/30' 
              : 'bg-white text-primary-600 hover:bg-primary-500 hover:text-white border border-primary-200 hover:shadow-lg hover:shadow-primary-500/20'
            }
          `}
          title="Direct Messages"
        >
          <FiMessageCircle size={24} />
          
          {/* Active Indicator */}
          <div className={`
            absolute left-0 w-1 bg-secondary-600 rounded-r-full transition-all duration-300 origin-left
            ${location.pathname === '/' ? 'h-8' : 'h-0 group-hover:h-8'}
          `}></div>

          {/* Tooltip */}
          <div className="absolute left-16 bg-dark-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-primary-700 z-[60]">
            Direct Messages
          </div>
        </NavLink>

        {/* Divider */}
        <div className="w-8 h-[2px] bg-primary-200 rounded-full mx-auto"></div>

        {/* Servers List */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar space-y-3 px-3">
          {servers.length > 0 ? (
            servers.map((server) => (
              <NavLink
                key={server._id}
                to={`/server/${server._id}`}
                className={({ isActive }) => `
                  group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-2xl transition-all duration-300 overflow-hidden
                  ${isActive || isServerActive(server._id)
                    ? 'rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                    : 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-500 hover:text-white hover:shadow-lg hover:shadow-primary-500/20'
                  }
                `}
                title={server.name}
              >
                {server.icon ? (
                  <img 
                    src={server.icon} 
                    alt={server.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${server.name}&background=8b5cf6&color=fff&bold=true`;
                    }}
                  />
                ) : (
                  <span className="text-lg font-bold uppercase">
                    {server.name?.substring(0, 2) || 'SV'}
                  </span>
                )}
                
                {/* Active Indicator */}
                <div className={`
                  absolute left-0 w-1 bg-secondary-600 rounded-r-full transition-all duration-300 origin-left
                  ${isServerActive(server._id) ? 'h-8' : 'h-0 group-hover:h-8'}
                `}></div>

                {/* Server Icon Fallback for loading errors */}
                {!server.icon && (
                  <div className="absolute inset-0 bg-primary-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiHash size={20} className="text-primary-600" />
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute left-16 bg-dark-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-primary-700 z-[60]">
                  {server.name}
                  {server.isPublic === false && (
                    <span className="ml-2 text-xs bg-dark-400 px-1.5 py-0.5 rounded">Private</span>
                  )}
                </div>
              </NavLink>
            ))
          ) : (
            // Empty state
            <div className="w-12 h-12 rounded-[24px] bg-primary-50 border border-primary-200 flex flex-col items-center justify-center text-primary-300 group hover:bg-primary-100 transition-all cursor-default">
              <FiUsers size={16} className="opacity-50" />
              <span className="text-[8px] font-bold mt-0.5">Empty</span>
              
              {/* Tooltip */}
              <div className="absolute left-16 bg-dark-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-primary-700 z-[60]">
                No servers yet
              </div>
            </div>
          )}

          {/* Create Server Button */}
          <button
            onClick={() => {
              resetCreateServerModal();
              setShowCreateServer(true);
            }}
            className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-2xl transition-all duration-300 bg-white text-primary-500 hover:bg-primary-500 hover:text-white border border-primary-200 hover:shadow-lg hover:shadow-primary-500/20"
            title="Create Server"
          >
            <FiPlus size={24} />
            
            {/* Tooltip */}
            <div className="absolute left-16 bg-dark-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-primary-700 z-[60]">
              Create Server
            </div>
          </button>

          {/* Explore Button */}
          <NavLink
            to="/explore"
            className={({ isActive }) => `
              group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-primary-500 rounded-2xl text-white shadow-lg shadow-primary-500/30' 
                : 'bg-white text-primary-500 hover:bg-primary-500 hover:text-white border border-primary-200 hover:shadow-lg hover:shadow-primary-500/20'
              }
            `}
            title="Explore Servers"
          >
            <FiCompass size={24} />
            
            {/* Tooltip */}
            <div className="absolute left-16 bg-dark-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-primary-700 z-[60]">
              Explore
            </div>
          </NavLink>
        </div>

        {/* Divider */}
        <div className="w-8 h-[2px] bg-primary-200 rounded-full mx-auto"></div>

        {/* User Section */}
        {user && (
          <div className="space-y-3 pb-2 w-full px-3">
            {/* Profile Button */}
            <button
              onClick={() => navigate(`/profile/${user.username}`)}
              className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-2xl transition-all duration-300 overflow-hidden bg-white hover:bg-primary-500 border border-primary-200 hover:shadow-lg hover:shadow-primary-500/20"
              title="Profile"
            >
              <img 
                src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=8b5cf6&color=fff&bold=true`} 
                alt={user?.username} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=8b5cf6&color=fff&bold=true`;
                }}
              />
              
              {/* Online Status */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>

              {/* Tooltip */}
              <div className="absolute left-16 bg-dark-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-primary-700 z-[60]">
                {user.profile?.displayName || user.username}
                <span className="ml-2 text-xs bg-primary-600 px-1.5 py-0.5 rounded">Profile</span>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-2xl transition-all duration-300 bg-white text-primary-500 hover:bg-red-500 hover:text-white border border-primary-200 hover:shadow-lg hover:shadow-red-500/20"
              title="Logout"
            >
              <FiLogOut size={20} />
              
              {/* Tooltip */}
              <div className="absolute left-16 bg-dark-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-primary-700 z-[60]">
                Logout
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Create Server Modal */}
      {showCreateServer && (
        <div 
          className="fixed inset-0 bg-dark-500/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setShowCreateServer(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-primary-200 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-dark-600">Create a New Server</h2>
              <button
                onClick={() => setShowCreateServer(false)}
                className="p-2 hover:bg-primary-100 rounded-full transition-colors"
              >
                <FiX size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleCreateServer} className="space-y-5">
              {/* Server Icon Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[32px] bg-primary-100 border-2 border-primary-200 overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Server preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiHash size={40} className="text-primary-400" />
                    )}
                  </div>
                  <label 
                    htmlFor="icon-upload" 
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 hover:bg-primary-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110 border-2 border-white"
                  >
                    <FiUpload size={16} />
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Server Name */}
              <div>
                <label className="text-xs font-black text-dark-400 uppercase tracking-widest mb-2 block">
                  Server Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-primary-50 border border-primary-200 rounded-xl p-3 text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="My Awesome Server"
                  maxLength={50}
                  required
                  autoFocus
                />
                <p className="text-[10px] text-dark-400 mt-1 text-right">
                  {newServer.name.length}/50
                </p>
              </div>

              {/* Server Description */}
              <div>
                <label className="text-xs font-black text-dark-400 uppercase tracking-widest mb-2 block">
                  Description
                </label>
                <textarea
                  className="w-full bg-primary-50 border border-primary-200 rounded-xl p-3 text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none"
                  value={newServer.description}
                  onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
                  placeholder="What is this server about?"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-[10px] text-dark-400 mt-1 text-right">
                  {newServer.description.length}/200
                </p>
              </div>

              {/* Server Settings Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-dark-400 uppercase tracking-widest mb-2 block">
                    Visibility
                  </label>
                  <select
                    className="w-full bg-primary-50 border border-primary-200 rounded-xl p-3 text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    value={newServer.isPublic ? 'public' : 'private'}
                    onChange={(e) => setNewServer({ ...newServer, isPublic: e.target.value === 'public' })}
                  >
                    <option value="public">🌍 Public</option>
                    <option value="private">🔒 Private</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-dark-400 uppercase tracking-widest mb-2 block">
                    Category
                  </label>
                  <select
                    className="w-full bg-primary-50 border border-primary-200 rounded-xl p-3 text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    value={newServer.category}
                    onChange={(e) => setNewServer({ ...newServer, category: e.target.value })}
                  >
                    <option value="other">🎯 Other</option>
                    <option value="gaming">🎮 Gaming</option>
                    <option value="tech">💻 Tech</option>
                    <option value="music">🎵 Music</option>
                    <option value="education">📚 Education</option>
                    <option value="friends">👥 Friends</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !newServer.name.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>CREATE SERVER</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateServer(false)}
                  className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-700 py-3 rounded-xl font-black text-sm transition-all"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-dark-500/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-primary-200 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogOut size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-black text-dark-600">Logout Confirmation</h2>
              <p className="text-dark-400">Are you sure you want to logout? You'll need to login again to access your servers and friends.</p>
              
              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
                >
                  YES, LOGOUT
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98]"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
