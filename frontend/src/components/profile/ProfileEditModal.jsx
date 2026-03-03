import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import AvatarUpload from './AvatarUpload'
import { userApi } from '../../api/userApi'
import { showToast } from '../ui/Toast'
import { Upload, X } from 'lucide-react'

const ProfileEditModal = ({ isOpen, onClose, profile, onProfileUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    city: '',
    state: '',
    website: '',
    avatar: null,
    coverImage: null,
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        city: profile.city || '',
        state: profile.state || '',
        website: profile.website || '',
        avatar: null,
        coverImage: null,
      })
      setAvatarPreview(profile.avatar || null)
      setCoverPreview(profile.coverImage || null)
    }
  }, [profile])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAvatarChange = (file, preview) => {
    setFormData({ ...formData, avatar: file })
    setAvatarPreview(preview)
  }

  const handleCoverChange = (file, preview) => {
    setFormData({ ...formData, coverImage: file })
    setCoverPreview(preview)
  }

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatar: null })
    setAvatarPreview(null)
  }

  const handleRemoveCover = () => {
    setFormData({ ...formData, coverImage: null })
    setCoverPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key === 'avatar' || key === 'coverImage') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key])
          }
        } else {
          formDataToSend.append(key, formData[key])
        }
      })

      await userApi.updateProfile(formDataToSend)
      showToast.success('Profile updated successfully')
      onProfileUpdated?.()
      onClose()
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <AvatarUpload
              currentImage={avatarPreview}
              onImageChange={handleAvatarChange}
              onRemove={handleRemoveAvatar}
              type="avatar"
            />
            <p className="text-sm text-gray-500">
              Recommended: Square image, at least 200x200px
            </p>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="space-y-2">
            {coverPreview ? (
              <div className="relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const preview = URL.createObjectURL(file)
                      handleCoverChange(file, preview)
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="cover-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload cover image</span>
                  <span className="text-xs text-gray-500 mt-1">Recommended: 1200x300px</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="New York"
          />
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="NY"
          />
        </div>

        {/* Website */}
        <Input
          label="Website"
          name="website"
          type="url"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProfileEditModal