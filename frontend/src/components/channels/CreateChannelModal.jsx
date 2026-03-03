import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { channelApi } from '../../api/channelApi'
import { showToast } from '../ui/Toast'
import { Hash, Volume2 } from 'lucide-react'

const CreateChannelModal = ({ isOpen, onClose, serverId, onChannelCreated }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    topic: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showToast.error('Channel name is required')
      return
    }

    setLoading(true)

    try {
      await channelApi.createChannel(serverId, formData)
      showToast.success('Channel created successfully')
      onChannelCreated()
      onClose()
      setFormData({ name: '', type: 'text', topic: '' })
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create channel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Channel">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Channel Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'text' })}
                className={`
                  flex items-center justify-center px-4 py-3 border rounded-lg
                  ${formData.type === 'text'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Hash size={20} className="mr-2" />
                Text Channel
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'voice' })}
                disabled
                className="
                  flex items-center justify-center px-4 py-3 border rounded-lg
                  border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed
                "
                title="Voice channels coming soon"
              >
                <Volume2 size={20} className="mr-2" />
                Voice Channel
              </button>
            </div>
          </div>

          {/* Channel Name */}
          <Input
            label="Channel Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={formData.type === 'text' ? 'general-chat' : 'voice-chat'}
            required
            icon={<Hash size={18} />}
          />

          {/* Channel Topic (for text channels) */}
          {formData.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="What's this channel about?"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>
          )}

          {/* Info Text */}
          <p className="text-xs text-gray-500">
            {formData.type === 'text' 
              ? 'Text channels are where conversations happen.'
              : 'Voice channels are for real-time audio conversation.'}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Create Channel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateChannelModal