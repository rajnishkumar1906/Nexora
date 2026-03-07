import React, { useState, useEffect } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiHash, FiVolume2, FiPlus, FiChevronDown, FiSettings, FiUserPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useNexora } from '../context/NexoraContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const Server = () => {
  const { serverId } = useParams();
  const { user } = useNexora();
  const { socket } = useSocket();
  const [server, setServer] = useState(null);
  const [channels, setChannels] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showChannelMenu, setShowChannelMenu] = useState(null);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    type: 'text',
    description: ''
  });
  const [showMembers, setShowMembers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServerData();

    if (socket && serverId) {
      socket.emit('join_server_updates', serverId);
      socket.emit('fetch_server_members', serverId);

      socket.on('server_members_list', ({ members: serverMembers }) => {
        setMembers(serverMembers);
      });

      socket.on('member_joined', ({ member }) => {
        setMembers((prev) => [...prev, member]);
        toast.success(`${member.user.username} joined the server!`);
      });

      socket.on('member_left', ({ userId, username }) => {
        setMembers((prev) => prev.filter(m => m.user._id !== userId));
        if (userId === user?._id) {
          toast.error('You left the server');
          navigate('/');
        } else {
          toast.info(`${username} left the server`);
        }
      });

      socket.on('member_kicked', ({ userId, username }) => {
        setMembers((prev) => prev.filter(m => m.user._id !== userId));
        if (userId === user?._id) {
          toast.error('You have been removed from this server');
          navigate('/');
        } else {
          toast.error(`${username} was kicked from the server`);
        }
      });

      socket.on('server_updated', (updatedServer) => {
        setServer(updatedServer);
        toast.success('Server updated!');
      });

      socket.on('channel_created', (newChannel) => {
        setChannels((prev) => [...prev, newChannel].sort((a, b) => a.order - b.order));
        toast.success(`Channel #${newChannel.name} created!`);
      });

      socket.on('channel_updated', (updatedChannel) => {
        setChannels((prev) => prev.map(c => 
          c._id === updatedChannel._id ? updatedChannel : c
        ).sort((a, b) => a.order - b.order));
        toast.success('Channel updated!');
      });

      socket.on('channel_deleted', ({ channelId, channelName }) => {
        setChannels((prev) => prev.filter(c => c._id !== channelId));
        toast.info(`Channel #${channelName} deleted`);
      });

      return () => {
        socket.emit('leave_server_updates', serverId);
        socket.off('server_members_list');
        socket.off('member_joined');
        socket.off('member_left');
        socket.off('member_kicked');
        socket.off('server_updated');
        socket.off('channel_created');
        socket.off('channel_updated');
        socket.off('channel_deleted');
      };
    }
  }, [serverId, socket]);

  const fetchServerData = async () => {
    setLoading(true);
    try {
      const serverRes = await axios.get(`/api/servers/${serverId}`, { withCredentials: true });
      if (serverRes.data.success) {
        setServer(serverRes.data.server);
        const membership = serverRes.data.membership;
        if (membership) {
          const channelsRes = await axios.get(`/api/channels/server/${serverId}`, { withCredentials: true });
          if (channelsRes.data.success) {
            setChannels(channelsRes.data.channels);
            if (window.location.pathname === `/server/${serverId}` && channelsRes.data.channels.length > 0) {
              navigate(`/server/${serverId}/channel/${channelsRes.data.channels[0]._id}`);
            }
          }
        } else {
          setChannels([]);
          toast('Join this public server to view channels', { icon: '👋' });
        }
      }
    } catch (error) {
      console.error('Fetch server data error:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied to this private server');
        navigate('/');
      } else {
        toast.error('Failed to load server');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    
    if (!newChannelData.name.trim()) {
      toast.error('Channel name is required');
      return;
    }

    try {
      const { data } = await axios.post('/api/channels', {
        serverId,
        name: newChannelData.name.toLowerCase().replace(/\s+/g, '-'),
        type: newChannelData.type,
        description: newChannelData.description
      }, { withCredentials: true });

      if (data.success) {
        setShowCreateChannel(false);
        setNewChannelData({ name: '', type: 'text', description: '' });
        // Channels will be updated via socket
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create channel');
    }
  };

  const handleDeleteChannel = async (channelId, channelName) => {
    if (!window.confirm(`Are you sure you want to delete #${channelName}?`)) return;

    try {
      const { data } = await axios.delete(`/api/channels/${channelId}`, { withCredentials: true });
      if (data.success) {
        setShowChannelMenu(null);
        // Channel will be removed via socket
      }
    } catch (error) {
      toast.error('Failed to delete channel');
    }
  };

  const handleInvitePeople = () => {
    const inviteLink = `${window.location.origin}/invite/${server?.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  const handleServerSettings = () => {
    toast('Server settings coming soon!', { icon: '⚙️' });
    setShowServerMenu(false);
  };

  const handleLeaveServer = async () => {
    if (!window.confirm('Are you sure you want to leave this server?')) return;

    try {
      const { data } = await axios.post(`/api/servers/${serverId}/leave`, {}, { withCredentials: true });
      if (data.success) {
        toast.success('Left server');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to leave server');
    }
  };

  const isOwner = server?.owner === user?._id;
  const isAdmin = isOwner || members.find(m => m.user._id === user?._id)?.role === 'admin';

  if (loading) return (
    <div className="flex-1 glass flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden text-sharp">
      {/* Channels Sidebar */}
      <div className="w-60 glass flex flex-col shrink-0 overflow-hidden border-r border-primary-200/60">
        {/* Server Header with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowServerMenu(!showServerMenu)}
            className="w-full h-12 px-4 flex items-center justify-between hover:bg-primary-100 transition-colors border-b border-primary-200 group shadow-sm"
          >
            <h1 className="font-black text-dark-600 truncate text-sm tracking-tight">{server?.name}</h1>
            <FiChevronDown className={`text-dark-300 group-hover:text-primary-600 transition-all duration-200 ${showServerMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Server Dropdown Menu */}
          {showServerMenu && (
            <div className="absolute top-12 left-2 right-2 bg-white rounded-xl shadow-2xl border border-primary-200 py-1 z-50 animate-slideDown">
              <button
                onClick={handleInvitePeople}
                className="w-full px-3 py-2 text-left text-sm text-dark-600 hover:bg-primary-50 flex items-center space-x-2"
              >
                <FiUserPlus size={16} className="text-primary-600" />
                <span>Invite People</span>
              </button>
              {(isAdmin) && (
                <>
                  <button
                    onClick={handleServerSettings}
                    className="w-full px-3 py-2 text-left text-sm text-dark-600 hover:bg-primary-50 flex items-center space-x-2"
                  >
                    <FiSettings size={16} className="text-dark-400" />
                    <span>Server Settings</span>
                  </button>
                  <button
                    onClick={() => setShowCreateChannel(true)}
                    className="w-full px-3 py-2 text-left text-sm text-dark-600 hover:bg-primary-50 flex items-center space-x-2"
                  >
                    <FiPlus size={16} className="text-green-600" />
                    <span>Create Channel</span>
                  </button>
                </>
              )}
              <div className="border-t border-primary-100 my-1"></div>
              <button
                onClick={handleLeaveServer}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <span>Leave Server</span>
              </button>
            </div>
          )}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-4">
          {/* Text Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-1 group">
              <span className="text-xs font-black text-dark-400 uppercase tracking-widest">Text Channels</span>
              {isAdmin && (
                <button 
                  onClick={() => {
                    setNewChannelData({ ...newChannelData, type: 'text' });
                    setShowCreateChannel(true);
                  }}
                  className="text-dark-300 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Create Text Channel"
                >
                  <FiPlus size={16} />
                </button>
              )}
            </div>
            
            {channels.filter(c => c.type === 'text').map((channel) => (
              <div key={channel._id} className="relative group">
                <NavLink
                  to={`/server/${serverId}/channel/${channel._id}`}
                  className={({ isActive }) => `
                    flex items-center justify-between px-2 py-1.5 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-primary-200 text-dark-600 font-bold' : 'text-dark-400 hover:bg-primary-100 hover:text-primary-600'}
                  `}
                >
                  <div className="flex items-center space-x-2 truncate flex-1">
                    <FiHash className="shrink-0 text-dark-300" size={16} />
                    <span className="truncate text-sm">{channel.name}</span>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowChannelMenu(showChannelMenu === channel._id ? null : channel._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary-300 rounded transition-all"
                    >
                      <FiSettings size={14} />
                    </button>
                  )}
                </NavLink>

                {/* Channel Menu Dropdown */}
                {showChannelMenu === channel._id && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-2xl border border-primary-200 py-1 z-50 min-w-[160px]">
                    <button
                      onClick={() => {
                        toast('Edit channel coming soon!', { icon: '✏️' });
                        setShowChannelMenu(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-dark-600 hover:bg-primary-50 flex items-center space-x-2"
                    >
                      <FiEdit2 size={14} />
                      <span>Edit Channel</span>
                    </button>
                    <button
                      onClick={() => handleDeleteChannel(channel._id, channel.name)}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <FiTrash2 size={14} />
                      <span>Delete Channel</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Voice Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-1 group">
              <span className="text-xs font-black text-dark-400 uppercase tracking-widest">Voice Channels</span>
              {isAdmin && (
                <button 
                  onClick={() => {
                    setNewChannelData({ ...newChannelData, type: 'voice' });
                    setShowCreateChannel(true);
                  }}
                  className="text-dark-300 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Create Voice Channel"
                >
                  <FiPlus size={16} />
                </button>
              )}
            </div>
            
            {channels.filter(c => c.type === 'voice').map((channel) => (
              <div
                key={channel._id}
                className="group flex items-center justify-between px-2 py-1.5 rounded-lg text-dark-400 hover:bg-primary-100 hover:text-primary-600 transition-all cursor-pointer"
                onClick={() => toast('Voice channels coming soon!', { icon: '🎙️' })}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FiVolume2 className="shrink-0 text-dark-300" size={16} />
                  <span className="truncate text-sm">{channel.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Members List Toggle */}
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full mt-4 px-2 py-2 text-left text-xs font-black text-dark-400 uppercase tracking-widest hover:text-primary-600 transition-colors flex items-center justify-between"
          >
            <span>Members — {members.length}</span>
            <FiChevronDown className={`transform transition-transform ${showMembers ? 'rotate-180' : ''}`} size={14} />
          </button>

          {/* Members List */}
          {showMembers && (
            <div className="space-y-1 mt-2">
              {members.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-primary-100 cursor-pointer transition-all"
                  onClick={() => navigate(`/profile/${member.user.username}`)}
                >
                  <div className="relative">
                    <img
                      src={member.user.profile?.avatar || `https://ui-avatars.com/api/?name=${member.user.username}&background=8b5cf6&color=fff`}
                      className="w-6 h-6 rounded-full object-cover border border-primary-200"
                      alt={member.user.username}
                    />
                    <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                      member.user.profile?.status === 'online' ? 'bg-primary-600' : 'bg-dark-300'
                    }`}></div>
                  </div>
                  <span className="text-xs font-medium text-dark-600 truncate">
                    {member.user.profile?.displayName || member.user.username}
                  </span>
                  {member.role === 'owner' && (
                    <span className="text-[8px] font-black text-yellow-600 uppercase ml-auto">Owner</span>
                  )}
                  {member.role === 'admin' && (
                    <span className="text-[8px] font-black text-primary-600 uppercase ml-auto">Admin</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Bar */}
        <footer className="bg-primary-100 p-2 flex items-center justify-between border-t border-primary-200">
          <div className="flex items-center space-x-2 flex-1 min-w-0 group cursor-pointer p-1 rounded-lg hover:bg-primary-200 transition-all">
            <div className="relative shrink-0">
              <img 
                src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=8b5cf6&color=fff`} 
                alt={user?.username} 
                className="w-8 h-8 rounded-full object-cover border border-primary-300" 
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-dark-600 truncate leading-tight">{user?.profile?.displayName}</p>
              <p className="text-[10px] text-dark-400 truncate leading-tight">@{user?.username}</p>
            </div>
          </div>
          <button 
            onClick={() => toast('User settings coming soon!', { icon: '⚙️' })}
            className="p-1.5 text-dark-300 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-200"
            title="Settings"
          >
            <FiSettings size={16} />
          </button>
        </footer>
      </div>

      {/* Channel Area */}
      <div className="flex-1 flex flex-col glass relative overflow-hidden">
        <Outlet />
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div 
          className="fixed inset-0 bg-dark-500/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreateChannel(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full m-4 shadow-2xl border border-primary-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-dark-600">Create {newChannelData.type === 'text' ? 'Text' : 'Voice'} Channel</h2>
              <button
                onClick={() => setShowCreateChannel(false)}
                className="p-1 hover:bg-primary-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateChannel}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-dark-400 uppercase mb-1 block">Channel Type</label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setNewChannelData({...newChannelData, type: 'text'})}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        newChannelData.type === 'text'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-primary-50 text-dark-400 border-primary-200 hover:bg-primary-100'
                      }`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChannelData({...newChannelData, type: 'voice'})}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        newChannelData.type === 'voice'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-primary-50 text-dark-400 border-primary-200 hover:bg-primary-100'
                      }`}
                    >
                      Voice
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-dark-400 uppercase mb-1 block">Channel Name</label>
                  <input
                    type="text"
                    className="w-full bg-primary-50 border border-primary-200 rounded-lg p-3 text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={newChannelData.name}
                    onChange={(e) => setNewChannelData({...newChannelData, name: e.target.value})}
                    placeholder={newChannelData.type === 'text' ? "general" : "General Voice"}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-dark-400 uppercase mb-1 block">Description (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-primary-50 border border-primary-200 rounded-lg p-3 text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={newChannelData.description}
                    onChange={(e) => setNewChannelData({...newChannelData, description: e.target.value})}
                    placeholder="What's this channel for?"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-black text-sm transition-all"
                  >
                    CREATE CHANNEL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateChannel(false)}
                    className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-700 py-3 rounded-xl font-black text-sm transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Server;
