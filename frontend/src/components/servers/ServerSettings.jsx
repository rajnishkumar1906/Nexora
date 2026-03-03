import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { serverApi } from '../../api/serverApi'
import { showToast } from '../ui/Toast'
import { Upload, X, Trash2 } from 'lucide-react'

const ServerSettings = ({ isOpen, onClose, server, onUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    icon: null,
  })
  const [iconPreview, setIconPreview] = useState(null)

  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name || '',
        description: server.description || '',
        category: server.category || 'Other',
        isPublic: server.isPublic !== false,
        icon: null,
      })
      setIconPreview(server.icon || null)
    }
  }, [server])

  const categories = [
    'Gaming', 'Study', 'Music', 'Tech', 'Art', 'Sports', 'Social', 'Other'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('File size must be less than 5MB')
      return
    }

    setFormData({ ...formData, icon: file })
    setIconPreview(URL.createObjectURL(file))
  }

  const handleRemoveIcon = () => {
    setFormData({ ...formData, icon: null })
    setIconPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('isPublic', formData.isPublic)
      
      if (formData.icon) {
        formDataToSend.append('icon', formData.icon)
      }

      await serverApi.updateServer(server._id, formDataToSend)
      showToast.success('Server updated successfully')
      onUpdated?.()
      onClose()
    } catch (error) {
      showToast.error('Failed to update server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Server Settings" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Server Icon
          </label>
          <div className="flex items-center space-x-4">
            {iconPreview ? (
              <div className="relative">
                <img
                  src={iconPreview}
                  alt="Server icon"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveIcon}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload size={20} className="text-gray-400" />
              </div>
            )}
            <input
              type="file"
              id="icon-upload"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
            <label
              htmlFor="icon-upload"
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              Change Icon
            </label>
          </div>
        </div>

        {/* Server Name */}
        <Input
          label="Server Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Public/Private Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Public Server (anyone can discover and join)
          </label>
        </div>

        {/* Invite Code (read-only) */}
        {server?.inviteCode && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm">
                {server.inviteCode}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(server.inviteCode)
                  showToast.success('Invite code copied!')
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (window.confirm('Delete this server? This cannot be undone.')) {
                // Handle delete
              }
            }}
          >
            <Trash2 size={16} className="mr-2" />
            Delete Server
          </Button>
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default ServerSettings