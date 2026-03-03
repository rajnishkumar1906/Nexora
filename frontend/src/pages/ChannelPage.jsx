import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useChannel } from '../hooks/useChannel'
import { channelApi } from '../api/channelApi'
import MessageList from '../components/chat/MessageList'
import MessageInput from '../components/chat/MessageInput'
import ChannelHeader from '../components/channels/ChannelHeader'
import ServerMembersList from '../components/servers/ServerMembersList'
import { Users } from 'lucide-react'
import { showToast } from '../components/ui/Toast'

const ChannelPage = () => {
  const { serverId, channelId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [showMembers, setShowMembers] = useState(false)
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    messages,
    typingUsers,
    loading: messagesLoading,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
    loadMore,
    joinChannel,
    leaveChannel,
  } = useChannel(channelId)

  useEffect(() => {
    if (channelId) {
      loadChannel()
      joinChannel()

      return () => {
        leaveChannel()
      }
    }
  }, [channelId])

  useEffect(() => {
    if (!socket) return

    socket.on('messageDeleted', handleMessageDeleted)
    socket.on('messageEdited', handleMessageEdited)

    return () => {
      socket.off('messageDeleted')
      socket.off('messageEdited')
    }
  }, [socket])

  const loadChannel = async () => {
    try {
      setLoading(true)
      // You might need to add a getChannel endpoint
      // For now, we'll assume channel info is passed via context or state
      const { data } = await channelApi.getChannels(serverId)
      const currentChannel = data.channels?.find(c => c._id === channelId)
      setChannel(currentChannel)
    } catch (error) {
      showToast.error('Failed to load channel')
      navigate(`/servers/${serverId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageDeleted = ({ messageId }) => {
    // Message deletion is handled by useChannel
    console.log('Message deleted:', messageId)
  }

  const handleMessageEdited = ({ messageId, text, editedAt }) => {
    // Message editing is handled by useChannel
    console.log('Message edited:', messageId)
  }

  const handleSendMessage = async ({ text, attachments }) => {
    try {
      await sendMessage(text)
    } catch (error) {
      showToast.error('Failed to send message')
    }
  }

  const handleTyping = (isTyping) => {
    sendTyping(isTyping)
  }

  const handleScroll = (e) => {
    const { scrollTop } = e.target
    if (scrollTop === 0 && hasMore && !messagesLoading) {
      loadMore()
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Channel not found</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Channel Header */}
      <div className="flex-shrink-0">
        <ChannelHeader 
          channel={channel}
          onToggleMembers={() => setShowMembers(!showMembers)}
          showMemberButton={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            className="flex-1 overflow-y-auto"
            onScroll={handleScroll}
          >
            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              currentUser={user}
              onEditMessage={editMessage}
              onDeleteMessage={deleteMessage}
            />
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0">
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              placeholder={`Message #${channel.name}`}
            />
          </div>
        </div>

        {/* Members Sidebar (conditionally shown) */}
        {showMembers && (
          <div className="w-80 flex-shrink-0 border-l border-gray-200">
            <ServerMembersList
              serverId={serverId}
              onClose={() => setShowMembers(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile Members Toggle (visible on small screens) */}
      <button
        onClick={() => setShowMembers(!showMembers)}
        className="fixed bottom-4 right-4 lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Users size={20} />
      </button>
    </div>
  )
}

export default ChannelPage