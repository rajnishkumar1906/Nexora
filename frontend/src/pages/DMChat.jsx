import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiPlusCircle, FiSmile, FiGift, FiPhone, FiVideo, FiInfo, FiChevronLeft } from 'react-icons/fi';
import { useNexora } from '../context/NexoraContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const DMChat = () => {
  const { friendId } = useParams();
  const { user } = useNexora();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFriend, setNotFriend] = useState(false);
  const [friendState, setFriendState] = useState({ incoming: null, outgoing: null, isFriend: false });
  const messagesEndRef = useRef(null);

  const loadFriendState = async () => {
    try {
      // Check accepted friends
      const friendsRes = await fetch('/api/friends', { credentials: 'include' });
      const friendsData = await friendsRes.json();
      if (friendsData?.success && Array.isArray(friendsData.friends)) {
        if (friendsData.friends.find(f => (f._id || f.id) === friendId)) {
          setFriendState({ incoming: null, outgoing: null, isFriend: true });
          return;
        }
      }
      // Check pending
      const reqRes = await fetch('/api/friends/requests', { credentials: 'include' });
      const reqData = await reqRes.json();
      if (reqData?.success) {
        const incoming = (reqData.incoming || []).find(r => (r.sender?._id || r.sender?.id) === friendId);
        const outgoing = (reqData.outgoing || []).find(r => (r.recipient?._id || r.recipient?.id) === friendId);
        setFriendState({ incoming: incoming || null, outgoing: outgoing || null, isFriend: false });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (socket && friendId) {
      setLoading(true);
      
      socket.emit('get_dm_room', { friendId });

      socket.on('dm_room_ready', (readyRoom) => {
        setRoom(readyRoom);
        socket.emit('fetch_dm_history', { roomId: readyRoom._id });
      });

      socket.on('dm_history', ({ messages: historyMessages }) => {
        setMessages(historyMessages);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      });

      socket.on('new_dm_message', (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      socket.on('typing_dm_change', ({ userId, username, isTyping }) => {
        if (String(userId) !== String(user?._id)) {
          setTypingUser(isTyping ? username : null);
        }
      });

      // Handle socket errors (e.g., not friends)
      socket.on('error', (message) => {
        const msg = typeof message === 'string' ? message : (message?.message || 'Unable to open chat');
        if (msg.toLowerCase().includes('only chat with friends')) {
          setNotFriend(true);
          setLoading(false);
          loadFriendState();
        }
      });

      return () => {
        socket.off('dm_room_ready');
        socket.off('dm_history');
        socket.off('new_dm_message');
        socket.off('typing_dm_change');
        socket.off('error');
      };
    }
  }, [friendId, socket, user?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendFriendRequest = async () => {
    try {
      const res = await fetch(`/api/friends/request/${friendId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Friend request sent!');
        loadFriendState();
      } else {
        toast.error(data.message || 'Failed to send friend request');
      }
    } catch {
      toast.error('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/friends/accept/${requestId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Friend request accepted!');
        setNotFriend(false);
        setFriendState({ incoming: null, outgoing: null, isFriend: true });
        // Try to open room now
        socket?.emit('get_dm_room', { friendId });
      } else {
        toast.error(data.message || 'Failed to accept request');
      }
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !room) return;

    socket.emit('send_dm_message', {
      roomId: room._id,
      content: newMessage
    });
    
    setNewMessage('');
    socket.emit('typing_dm', { roomId: room._id, isTyping: false });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && room) {
      socket.emit('typing_dm', { roomId: room._id, isTyping: e.target.value.length > 0 });
    }
  };

  if (loading) return (
    <div className="flex-1 glass flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  const otherParticipant = (() => {
    if (!room || !user) return null;
    // Prefer the friendId from URL to avoid ambiguity
    const byFriendParam = room.participants?.find(p => String(p._id) === String(friendId));
    if (byFriendParam) return byFriendParam;
    const byId = room.participants?.find(p => String(p._id) !== String(user._id));
    if (byId) return byId;
    const byUsername = room.participants?.find(p => p.username && p.username !== user.username);
    return byUsername || null;
  })();

  if (notFriend) {
    return (
      <div className="flex-1 glass flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center glass-card animate-glow">
          <h2 className="text-xl font-black text-dark-600 mb-2">Add as a Friend to Chat</h2>
          <p className="text-dark-400 text-sm mb-4">
            You can only chat with users who are in your friends list.
          </p>
          {friendState.incoming ? (
            <div className="space-y-2">
              <p className="text-xs text-dark-400">This user sent you a friend request.</p>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleAcceptRequest(friendState.incoming._id)}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all"
                >
                  ACCEPT REQUEST
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-xl text-xs font-black transition-all"
                >
                  MANAGE IN FRIENDS
                </button>
              </div>
            </div>
          ) : friendState.outgoing ? (
            <div className="space-y-2">
              <p className="text-xs text-dark-400">Friend request sent. Waiting for acceptance.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-xl text-xs font-black transition-all"
              >
                VIEW PENDING
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={handleSendFriendRequest}
                className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all"
              >
                SEND REQUEST
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-xl text-xs font-black transition-all"
              >
                GO TO FRIENDS
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full glass overflow-hidden text-sharp">
      {/* Header */}
      <header className="h-14 border-b border-primary-200/70 px-4 flex items-center justify-between shrink-0 glass z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 text-dark-400 hover:text-primary-600">
            <FiChevronLeft size={20} />
          </button>
          <div className="relative">
            <img src={otherParticipant?.profile?.avatar} className="w-8 h-8 rounded-full object-cover border border-primary-200" />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
              otherParticipant?.profile?.status === 'online' ? 'bg-primary-600' : 'bg-dark-300'
            }`}></div>
          </div>
          <div>
            <h2 className="font-black text-dark-600 text-sm tracking-tight">{otherParticipant?.profile?.displayName}</h2>
            <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">{otherParticipant?.profile?.status}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-dark-400 hover:text-primary-600 transition-colors"><FiPhone size={20} /></button>
          <button className="p-2 text-dark-400 hover:text-primary-600 transition-colors"><FiVideo size={20} /></button>
          <button className="p-2 text-dark-400 hover:text-primary-600 transition-colors"><FiInfo size={20} /></button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 space-y-6">
        <div className="flex flex-col justify-end min-h-full">
          <div className="mb-10 text-center">
            <img src={otherParticipant?.profile?.avatar} className="w-24 h-24 rounded-[32px] mx-auto mb-4 border-4 border-primary-200 shadow-2xl" />
            <h1 className="text-3xl font-black text-dark-600 mb-1 tracking-tight">{otherParticipant?.profile?.displayName}</h1>
            <p className="text-dark-400 text-sm">This is the beginning of your direct message history with @{otherParticipant?.username}</p>
          </div>

          {messages.map((msg) => (
            <div key={msg._id} className={`flex space-x-3 group ${String(msg.author?._id) === String(user?._id) ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <img src={msg.author?.profile?.avatar} className="w-8 h-8 rounded-full object-cover border border-primary-200 shrink-0" />
              <div className={`max-w-[70%] ${String(msg.author?._id) === String(user?._id) ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                  String(msg.author?._id) === String(user?._id) 
                    ? 'bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-600/20' 
                    : 'bg-primary-50 text-dark-600 rounded-tl-none border border-primary-200'
                }`}>
                  {msg.content}
                </div>
                <p className="text-[10px] text-dark-400 mt-1 font-bold px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Typing */}
      {typingUser && (
        <div className="px-6 py-1 text-[10px] text-dark-400 font-bold italic animate-pulse">
          {typingUser} is typing...
        </div>
      )}

      {/* Input */}
      <footer className="px-4 pb-6 shrink-0 glass">
        <form onSubmit={handleSendMessage} className="bg-primary-50 border border-primary-200 rounded-2xl p-2 flex items-center space-x-2">
          <button type="button" className="p-2 text-dark-300 hover:text-primary-600 transition-colors"><FiPlusCircle size={22} /></button>
          <input
            type="text"
            placeholder={`Message @${otherParticipant?.username}`}
            className="flex-1 bg-transparent border-none text-dark-600 placeholder:text-dark-300 focus:outline-none py-2 text-sm"
            value={newMessage}
            onChange={handleTyping}
          />
          <div className="flex items-center space-x-1 pr-1">
            <button type="button" className="p-2 text-dark-300 hover:text-primary-600 transition-colors"><FiGift size={20} /></button>
            <button type="button" className="p-2 text-dark-300 hover:text-primary-600 transition-colors"><FiSmile size={20} /></button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default DMChat;
