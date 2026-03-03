import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { friendApi } from '../../api/friendApi'
import { showToast } from '../ui/Toast'
import { Search, UserPlus, Check } from 'lucide-react'

const AddFriendModal = ({ isOpen, onClose, onFriendAdded }) => {
  const [step, setStep] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [sending, setSending] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    try {
      // This is a placeholder - you'll need to implement a search endpoint
      // const { data } = await userApi.searchUsers(searchQuery)
      // setSearchResults(data.users || [])
      
      // Mock data for now
      setSearchResults([
        { _id: '1', username: 'john_doe', avatar: '', status: 'online' },
        { _id: '2', username: 'jane_smith', avatar: '', status: 'offline' },
      ])
    } catch (error) {
      showToast.error('Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSendRequest = async () => {
    if (!selectedUser) return

    setSending(true)
    try {
      await friendApi.sendRequest(selectedUser._id)
      setStep('sent')
      onFriendAdded?.()
      showToast.success(`Friend request sent to ${selectedUser.username}`)
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to send request')
    } finally {
      setSending(false)
    }
  }

  const resetModal = () => {
    setStep('search')
    setSearchQuery('')
    setSearchResults([])
    setSelectedUser(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { resetModal(); onClose() }} title="Add Friend">
      <div className="space-y-4">
        {step === 'search' && (
          <>
            <p className="text-sm text-gray-600">
              You can add a friend with their Nexora username.
            </p>
            <Input
              placeholder="Enter username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search size={18} />}
              autoFocus
            />
            <div className="flex justify-end">
              <Button onClick={handleSearch} loading={searchLoading}>
                Search
              </Button>
            </div>
          </>
        )}

        {step === 'sent' && selectedUser && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Request Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              Your friend request to {selectedUser.username} has been sent.
            </p>
            <Button onClick={() => { resetModal(); onClose() }}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AddFriendModal