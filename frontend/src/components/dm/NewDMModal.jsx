import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Avatar from '../ui/Avatar'
import { friendApi } from '../../api/friendApi'
import { chatApi } from '../../api/chatApi'
import { showToast } from '../ui/Toast'
import { Search, MessageCircle, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NewDMModal = ({ isOpen, onClose, onChatCreated }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [step, setStep] = useState('select')

  useEffect(() => {
    if (isOpen) {
      loadFriends()
      setStep('select')
      setSelectedFriend(null)
      setSearchQuery('')
    }
  }, [isOpen])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const { data } = await friendApi.getFriends()
      setFriends(data.friends || [])
    } catch (error) {
      showToast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const startConversation = async () => {
    if (!selectedFriend) return

    try {
      const chatId = [user?._id, selectedFriend._id].sort().join('_')
      onChatCreated(chatId)
      onClose()
    } catch (error) {
      showToast.error('Failed to start conversation')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Message">
      <div className="space-y-4">
        {step === 'select' && (
          <>
            {/* Search Input */}
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={18} />}
            />

            {/* Friends List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                </div>
              ) : filteredFriends.length > 0 ? (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <button
                      key={friend._id}
                      onClick={() => {
                        setSelectedFriend(friend)
                        setStep('confirm')
                      }}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Avatar
                        src={friend.avatar}
                        name={friend.username}
                        size="sm"
                        status={friend.status}
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{friend.username}</p>
                        <p className="text-xs text-gray-500">
                          {friend.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                        </p>
                      </div>
                      <MessageCircle size={18} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No friends found</p>
                </div>
              )}
            </div>
          </>
        )}

        {step === 'confirm' && selectedFriend && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Avatar
                src={selectedFriend.avatar}
                name={selectedFriend.username}
                size="lg"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedFriend.username}</h3>
                <p className="text-sm text-gray-600">
                  {selectedFriend.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Start a new conversation with {selectedFriend.username}?
            </p>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={startConversation}>
                Start Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default NewDMModal