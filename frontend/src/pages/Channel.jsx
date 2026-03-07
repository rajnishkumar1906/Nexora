import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiHash, FiSend, FiPlusCircle, FiAtSign, FiSmile, FiGift, FiPaperclip } from 'react-icons/fi';
import { useNexora } from '../context/NexoraContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const Channel = () => {
  const { channelId } = useParams();
  const { user } = useNexora();
  const { socket } = useSocket();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket && channelId) {
      setLoading(true);
      socket.emit('join_channel', channelId);
      
      socket.on('channel_ready', (readyChannel) => {
        setChannel(readyChannel);
        socket.emit('fetch_channel_history', { channelId });
      });

      socket.on('channel_history', ({ messages: historyMessages }) => {
        setMessages(historyMessages);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      });

      socket.on('new_channel_message', (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      socket.on('typing_channel_change', ({ userId, username, isTyping }) => {
        if (userId === user.id) return;
        setTypingUsers((prev) => {
          if (isTyping) {
            return prev.includes(username) ? prev : [...prev, username];
          } else {
            return prev.filter(u => u !== username);
          }
        });
      });

      socket.on('reaction_change', ({ messageId, reactions }) => {
        setMessages((prev) => prev.map(m => 
          m._id === messageId ? { ...m, reactions } : m
        ));
      });

      return () => {
        socket.emit('leave_channel', channelId);
        socket.off('channel_ready');
        socket.off('channel_history');
        socket.off('new_channel_message');
        socket.off('typing_channel_change');
        socket.off('reaction_change');
      };
    }
  }, [channelId, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_channel_message', {
      channelId,
      content: newMessage
    });
    
    setNewMessage('');
    socket.emit('typing_channel', { channelId, isTyping: false });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing_channel', { channelId, isTyping: e.target.value.length > 0 });
    }
  };

  const handleReaction = (messageId, emoji) => {
    if (socket) {
      socket.emit('reaction_channel', { messageId, emoji });
    }
  };

  if (loading) return (
    <div className="flex-1 glass flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full glass overflow-hidden text-sharp">
      {/* Channel Header */}
      <header className="h-12 border-b border-primary-200/70 px-4 flex items-center justify-between shrink-0 glass shadow-sm">
        <div className="flex items-center space-x-2">
          <FiHash className="text-dark-300 text-xl shrink-0" />
          <h2 className="font-black text-dark-600 text-sm tracking-tight truncate">{channel?.name}</h2>
          {channel?.description && (
            <>
              <div className="w-[1px] h-6 bg-primary-200/70 mx-2"></div>
              <p className="text-xs text-dark-400 truncate max-w-md italic">{channel?.description}</p>
            </>
          )}
        </div>
      </header>

      {/* Messages List */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 space-y-6">
        <div className="flex flex-col justify-end min-h-full">
           {/* Welcome Section */}
           <div className="mb-10 p-6 border-b border-primary-200 bg-gradient-to-tr from-primary-50 to-transparent rounded-3xl">
              <div className="w-20 h-20 rounded-[32px] bg-primary-100 flex items-center justify-center mb-4 border border-primary-200">
                <FiHash className="text-primary-600 text-4xl" />
              </div>
              <h1 className="text-4xl font-black text-dark-600 mb-2 tracking-tight">Welcome to #{channel?.name}!</h1>
              <p className="text-dark-400 text-lg">This is the start of the #{channel?.name} channel.</p>
           </div>

           {messages.map((message) => (
             <div key={message._id} className="flex space-x-4 group hover:bg-primary-50 p-2 rounded-2xl transition-all border border-transparent hover:border-primary-200">
               <img src={message.author?.profile?.avatar} alt={message.author?.username} className="w-10 h-10 rounded-full object-cover shrink-0 border border-primary-200 shadow-lg" />
               <div className="flex-1 min-w-0">
                 <div className="flex items-center space-x-2 mb-1">
                   <span className="font-black text-dark-600 hover:underline cursor-pointer transition-colors tracking-tight">{message.author?.profile?.displayName}</span>
                   <span className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">
                     {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
                 <p className="text-dark-600 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                 
                 {/* Reactions */}
                 {message.reactions?.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-2">
                     {message.reactions.map((reaction, i) => (
                       <button
                         key={i}
                         onClick={() => handleReaction(message._id, reaction.emoji)}
                         className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-lg border text-xs transition-all ${
                           reaction.users.includes(user.id)
                             ? 'bg-primary-100 border-primary-300 text-primary-700'
                             : 'bg-white border-primary-200 text-dark-400 hover:border-primary-300'
                         }`}
                       >
                         <span>{reaction.emoji}</span>
                         <span className="font-bold">{reaction.users.length}</span>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-1 text-[10px] text-dark-400 font-bold italic animate-pulse">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Message Input */}
      <footer className="px-4 pb-6 shrink-0 glass">
        <form onSubmit={handleSendMessage} className="bg-primary-50 border border-primary-200 rounded-3xl p-3 flex items-center space-x-3 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary-500/30">
          <button type="button" className="p-2 text-dark-400 hover:text-primary-600 transition-colors hover:bg-primary-100 rounded-full" title="Attach Files">
            <FiPlusCircle size={22} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Message #${channel?.name}`}
              className="w-full bg-transparent border-none text-dark-600 placeholder:text-dark-300 focus:outline-none py-2 text-sm font-medium"
              value={newMessage}
              onChange={handleTyping}
            />
          </div>

          <div className="flex items-center space-x-1 shrink-0 px-2 border-l border-primary-200">
             <button type="button" className="p-2 text-dark-300 hover:text-primary-600 transition-colors" title="Send a Gift">
               <FiGift size={20} />
             </button>
             <button type="button" className="p-2 text-dark-300 hover:text-primary-600 transition-colors" title="Select Emoji">
               <FiSmile size={20} />
             </button>
             <button type="submit" className={`p-2 rounded-full transition-all ${newMessage.trim() ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-dark-300 cursor-not-allowed'}`} disabled={!newMessage.trim()}>
               <FiSend size={20} />
             </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default Channel;
