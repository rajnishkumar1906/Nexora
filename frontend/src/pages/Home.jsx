import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiMessageSquare, FiUserPlus, FiSearch, FiX } from 'react-icons/fi';
import { Gamepad2 } from 'lucide-react';
import { useNexora } from '../context/NexoraContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user: currentUser } = useNexora();
  const { socket } = useSocket();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const [activeTab, setActiveTab] = useState('online');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState('tic-tac-toe');
  const [inviteSearch, setInviteSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchFriends();
      fetchPendingRequests();
    }

    if (socket) {
      socket.on('user_status_change', ({ userId, status }) => {
        setFriends((prev) => prev.map(f =>
          f._id === userId ? { ...f, profile: { ...f.profile, status } } : f
        ));
      });

      socket.on('friend_request_received', () => {
        fetchPendingRequests();
        toast.success('New friend request received!');
      });

      socket.on('friend_request_accepted', ({ senderId }) => {
        fetchFriends();
        fetchPendingRequests();
        toast.success('Friend request accepted!');
      });

      return () => {
        socket.off('user_status_change');
        socket.off('friend_request_received');
        socket.off('friend_request_accepted');
      };
    }
  }, [socket, currentUser]);

  // Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleUserSearch();
      } else {
        setSearchResults(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleUserSearch = async () => {
    setIsSearching(true);
    try {
      const { data } = await axios.get(`/api/profile/search?q=${searchTerm}`, { withCredentials: true });
      if (data.success) {
        // Filter out current user and existing friends
        const filteredUsers = data.results.filter(user => 
          user._id !== currentUser?._id && 
          !friends.some(f => f._id === user._id) &&
          !pendingRequests.outgoing.some(req => req.recipient?._id === user._id)
        );
        
        setSearchResults({
          users: filteredUsers,
          servers: []
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (recipientId, recipientUsername) => {
    try {
      if (recipientId === currentUser?._id) {
        toast.error("You can't send a friend request to yourself");
        return;
      }

      if (friends.some(f => f._id === recipientId)) {
        toast.error("You're already friends with this user");
        return;
      }

      const existingPending = pendingRequests.outgoing.some(
        req => req.recipient?._id === recipientId
      );
      if (existingPending) {
        toast.error("Friend request already pending");
        return;
      }

      const { data } = await axios.post(`/api/friends/request/${recipientId}`, {}, {
        withCredentials: true
      });

      if (data.success) {
        toast.success(`Friend request sent to ${recipientUsername}!`);
        fetchPendingRequests();
        // Remove from search results
        setSearchResults(prev => ({
          ...prev,
          users: prev.users.filter(u => u._id !== recipientId)
        }));
      }
    } catch (error) {
      console.error('Friend request error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const fetchFriends = async () => {
    try {
      const { data } = await axios.get('/api/friends', { withCredentials: true });
      if (data.success) {
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Fetch friends error:', error);
      setFriends([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data } = await axios.get('/api/friends/requests', { withCredentials: true });
      if (data.success) {
        setPendingRequests({
          incoming: data.incoming || [],
          outgoing: data.outgoing || []
        });
      }
    } catch (error) {
      console.error('Fetch pending requests error:', error);
      setPendingRequests({ incoming: [], outgoing: [] });
    }
  };

  const handleAcceptRequest = async (requestId, senderName) => {
    try {
      const { data } = await axios.post(`/api/friends/accept/${requestId}`, {}, { withCredentials: true });
      if (data.success) {
        toast.success(`You are now friends with ${senderName}!`);
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { data } = await axios.post(`/api/friends/reject/${requestId}`, {}, { withCredentials: true });
      if (data.success) {
        toast.success('Friend request rejected');
        fetchPendingRequests();
      }
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleStartChat = (friendId) => {
    navigate(`/chat/${friendId}`);
  };

  const handleInviteToGame = async (friendId, friendName) => {
    try {
      const { data } = await axios.post(`/api/games/invite/${friendId}`, { gameType: selectedGame }, { withCredentials: true });
      if (data.success) {
        toast.success(`Invited ${friendName} to play ${selectedGame === 'ludo' ? 'Ludo' : 'Tic-Tac-Toe'}`);
        navigate(`/game/${data.sessionId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send game invite');
    }
  };

  const getAvatarUrl = (user) => {
    return user.profile?.avatar || `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=8b5cf6&color=fff&bold=true`;
  };

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.profile?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'online') return matchesSearch && friend.profile?.status === 'online';
    if (activeTab === 'all') return matchesSearch;
    return false;
  });

  return (
    <div className="flex flex-col h-full glass overflow-hidden text-sharp">
      {/* Top Navbar */}
      <header className="h-12 border-b border-primary-200/70 px-4 flex items-center justify-between glass shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-dark-400 space-x-2 mr-4 border-r border-primary-200 pr-4">
            <FiUsers className="text-xl" />
            <span className="font-bold text-primary-700">Friends</span>
          </div>

          <div className="flex items-center space-x-2">
            {['online', 'all', 'pending'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowAddFriend(false);
                  setSearchTerm('');
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-dark-400 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <button
              onClick={() => {
                setShowAddFriend(true);
                setActiveTab('all');
                setSearchTerm('');
                setTimeout(() => {
                  document.getElementById('friend-search-input')?.focus();
                }, 100);
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ml-2"
            >
              <FiUserPlus />
              <span>Add Friend</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-dark-500 hover:bg-dark-400 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Gamepad2 size={16} />
              <span>Play</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Column - Friends List */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto no-scrollbar">
          {/* Search Input */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input
              id="friend-search-input"
              type="text"
              placeholder="Search for users..."
              className="w-full bg-primary-50 border border-primary-200 rounded-xl py-2 pl-10 pr-4 text-sm text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-500"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Add Friend Panel */}
          {showAddFriend && (
            <div className="mb-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl animate-slideDown">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-primary-700">Add New Friend</h3>
                <button 
                  onClick={() => {
                    setShowAddFriend(false);
                    setSearchTerm('');
                  }}
                  className="text-dark-400 hover:text-dark-600 p-1 hover:bg-primary-200 rounded-full transition-all"
                >
                  <FiX size={18} />
                </button>
              </div>
              <p className="text-xs text-dark-400 mb-3">Enter a username to send a friend request</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="username"
                  className="flex-1 bg-white border border-primary-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (searchTerm.length >= 2) {
                      handleUserSearch();
                    } else {
                      toast.error('Please enter at least 2 characters');
                    }
                  }}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-black"
                >
                  SEARCH
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {/* Search Results */}
            {searchTerm.length >= 2 && searchResults ? (
              <div className="space-y-6">
                <h2 className="text-xs font-bold text-dark-400 uppercase px-2 mb-2 tracking-wider flex items-center justify-between">
                  <span>Search Results</span>
                  {isSearching && <div className="w-3 h-3 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>}
                </h2>

                {searchResults.users?.length > 0 ? (
                  <div>
                    {searchResults.users.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-2 hover:bg-primary-50 rounded-xl transition-all">
                        <div
                          className="flex items-center space-x-3 cursor-pointer flex-1"
                          onClick={() => navigate(`/profile/${user.username}`)}
                        >
                          <img
                            src={getAvatarUrl(user)}
                            className="w-10 h-10 rounded-full object-cover border border-primary-200"
                            alt={user.username}
                          />
                          <div>
                            <p className="text-sm font-bold text-dark-600">{user.profile?.displayName || user.username}</p>
                            <p className="text-xs text-dark-400">@{user.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendFriendRequest(user._id, user.username);
                          }}
                          className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded-lg text-xs font-black transition-colors shadow-sm"
                        >
                          ADD FRIEND
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isSearching && (
                    <p className="text-center py-10 text-dark-400 text-sm italic">No users found for "{searchTerm}"</p>
                  )
                )}
              </div>
            ) : (
              <>
                {/* Header Count */}
                <h2 className="text-xs font-bold text-dark-400 uppercase px-2 mb-2 tracking-wider">
                  {activeTab === 'pending'
                    ? `Pending — ${pendingRequests.incoming.length + pendingRequests.outgoing.length}`
                    : `${activeTab} — ${filteredFriends.length}`
                  }
                </h2>

                {/* Pending Requests Tab */}
                {activeTab === 'pending' ? (
                  <div className="space-y-6">
                    {pendingRequests.incoming.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-dark-400 uppercase mb-2 px-2">Incoming Requests</h3>
                        {pendingRequests.incoming.map(request => (
                          <div key={request._id} className="flex items-center justify-between p-2 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-200">
                            <div
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                              onClick={() => navigate(`/profile/${request.sender.username}`)}
                            >
                              <img
                                src={getAvatarUrl(request.sender)}
                                className="w-10 h-10 rounded-full object-cover border border-primary-200"
                                alt={request.sender.username}
                              />
                              <div>
                                <p className="text-sm font-bold text-dark-600">{request.sender.profile?.displayName || request.sender.username}</p>
                                <p className="text-xs text-dark-400">@{request.sender.username}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAcceptRequest(request._id, request.sender.username)}
                                className="bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-black hover:bg-primary-500 shadow-lg shadow-primary-600/20"
                              >
                                ACCEPT
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request._id)}
                                className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-xs font-black hover:bg-primary-200"
                              >
                                REJECT
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {pendingRequests.outgoing.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-dark-400 uppercase mb-2 px-2">Outgoing Requests</h3>
                        {pendingRequests.outgoing.map(request => (
                          <div key={request._id} className="flex items-center justify-between p-2 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-200 opacity-70">
                            <div
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                              onClick={() => navigate(`/profile/${request.recipient.username}`)}
                            >
                              <img
                                src={getAvatarUrl(request.recipient)}
                                className="w-10 h-10 rounded-full object-cover border border-primary-200"
                                alt={request.recipient.username}
                              />
                              <div>
                                <p className="text-sm font-bold text-dark-600">{request.recipient.profile?.displayName || request.recipient.username}</p>
                                <p className="text-xs text-dark-400">@{request.recipient.username}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-dark-300 uppercase tracking-widest">Pending</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {pendingRequests.incoming.length === 0 && pendingRequests.outgoing.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-32 h-32 bg-primary-100 rounded-full mb-4 flex items-center justify-center">
                          <FiUserPlus className="text-primary-400 text-4xl" />
                        </div>
                        <p className="text-dark-400 font-medium">No pending requests</p>
                        <p className="text-xs text-dark-300 mt-1">Click "Add Friend" to connect with people!</p>
                      </div>
                    )}
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-32 h-32 bg-primary-100 rounded-full mb-4 flex items-center justify-center">
                      <FiUsers className="text-primary-400 text-4xl" />
                    </div>
                    <p className="text-dark-400 font-medium">No friends yet</p>
                    <p className="text-xs text-dark-300 mt-1">Click "Add Friend" to find people!</p>
                  </div>
                ) : (
                  filteredFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="group flex items-center justify-between p-2 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-200"
                    >
                      <div
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                        onClick={() => navigate(`/profile/${friend.username}`)}
                      >
                        <div className="relative">
                          <img
                            src={getAvatarUrl(friend)}
                            alt={friend.username}
                            className="w-10 h-10 rounded-full object-cover border border-primary-200"
                          />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            friend.profile?.status === 'online' ? 'bg-primary-600' : 'bg-dark-300'
                          }`}></div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-dark-600 group-hover:text-primary-600 transition-colors">
                              {friend.profile?.displayName || friend.username}
                            </span>
                          </div>
                          <p className="text-xs text-dark-300">@{friend.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartChat(friend._id)}
                          className="p-2 bg-primary-100 hover:bg-primary-600 rounded-full text-primary-700 hover:text-white transition-all shadow-lg"
                          title="Message"
                        >
                          <FiMessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => handleInviteToGame(friend._id, friend.profile?.displayName || friend.username)}
                          className="p-2 bg-primary-100 hover:bg-primary-600 rounded-full text-primary-700 hover:text-white transition-all shadow-lg"
                          title="Invite to Play"
                        >
                          <Gamepad2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column - Activity Sidebar */}
        <div className="w-80 border-l border-primary-200/70 glass p-4 hidden lg:block overflow-y-auto no-scrollbar">
          <h2 className="text-xl font-black text-primary-800 mb-6 tracking-tight">Active Now</h2>
          <div className="space-y-6">
            <div className="bg-white border border-primary-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-dark-400 mb-1">Welcome to Nexora!</p>
              <p className="text-xs text-dark-300">Connect with friends and start chatting</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-400/20 rounded-full blur-2xl group-hover:bg-primary-500/30 transition-all"></div>
              <h3 className="text-sm font-bold text-primary-800 mb-2">Online Friends</h3>
              <p className="text-xs text-dark-400 mb-4">
                {friends.filter(f => f.profile?.status === 'online').length} friends online
              </p>
              <div className="flex -space-x-2">
                {friends.filter(f => f.profile?.status === 'online').slice(0, 5).map(f => (
                  <img
                    key={f._id}
                    src={getAvatarUrl(f)}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    title={f.username}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {showInviteModal && (
        <div className="fixed inset-0 bg-dark-500/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-primary-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-dark-600">Invite to Play</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-dark-400 hover:text-dark-600">
                <FiX size={18} />
              </button>
            </div>
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
              <input
                type="text"
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-primary-50 border border-primary-200 rounded-xl py-2 pl-10 pr-4 text-sm text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
              />
            </div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-dark-400 uppercase tracking-widest">Game</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-primary-50 border border-primary-200 rounded-lg py-2 px-3 text-sm"
              >
                <option value="tic-tac-toe">Tic-Tac-Toe</option>
                <option value="ludo">Ludo (MVP)</option>
              </select>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
              {friends
                .filter(f => (f.username?.toLowerCase().includes(inviteSearch.toLowerCase()) || f.profile?.displayName?.toLowerCase().includes(inviteSearch.toLowerCase())))
                .map(friend => (
                  <div key={friend._id} className="flex items-center justify-between p-2 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-200">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getAvatarUrl(friend)}
                        alt={friend.username}
                        className="w-8 h-8 rounded-full object-cover border border-primary-200"
                      />
                      <div>
                        <p className="text-sm font-bold text-dark-600">{friend.profile?.displayName || friend.username}</p>
                        <p className="text-xs text-dark-300">@{friend.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await handleInviteToGame(friend._id, friend.profile?.displayName || friend.username);
                        setShowInviteModal(false);
                      }}
                      className="p-2 bg-primary-100 hover:bg-primary-600 rounded-full text-primary-700 hover:text-white transition-all shadow-lg"
                      title="Invite to Play"
                    >
                      <Gamepad2 size={18} />
                    </button>
                  </div>
                ))}
              {friends.length === 0 && (
                <div className="text-center text-dark-400 text-sm py-6">No friends to invite</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
