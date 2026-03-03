import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../../api/chatApi'
import DMItem from './DMItem'
import NewDMModal from './NewDMModal'
import { Plus, MessageCircle, Loader } from 'lucide-react'
import { showToast } from '../ui/Toast'
import { useAuth } from '../../context/AuthContext'

const DMList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewDMModal, setShowNewDMModal] = useState(false)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      setLoading(true)
      const { data } = await chatApi.getChatList()
      setChats(data.chats || [])
    } catch (error) {
      showToast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleChatClick = (chatId) => {
    navigate(`/dm/${chatId}`)
  }

  if (loading) {
    return (
      <div className="h-full bg-gray-800 flex items-center justify-center">
        <Loader size={24} className="animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-800 text-gray-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white">Direct Messages</h2>
          <button
            onClick={() => setShowNewDMModal(true)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="New Message"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* DM List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <DMItem
              key={chat.chatId}
              chat={chat}
              currentUser={user}
              onClick={() => handleChatClick(chat.chatId)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 mb-2">No conversations yet</p>
            <button
              onClick={() => setShowNewDMModal(true)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Start a new conversation
            </button>
          </div>
        )}
      </div>

      {/* New DM Modal */}
      <NewDMModal
        isOpen={showNewDMModal}
        onClose={() => setShowNewDMModal(false)}
        onChatCreated={(chatId) => {
          loadChats()
          navigate(`/dm/${chatId}`)
        }}
      />
    </div>
  )
}

export default DMList