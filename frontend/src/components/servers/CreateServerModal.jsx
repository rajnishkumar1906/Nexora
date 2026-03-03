import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { serverApi } from '../../api/serverApi'
import { showToast } from '../ui/Toast'
import { 
  Upload, 
  X, 
  Sparkles, 
  Shield, 
  Users, 
  Globe, 
  Lock,
  Gamepad2,
  Music,
  BookOpen,
  Palette,
  Trophy,
  Coffee,
  ChevronRight,
  Check,
  Camera
} from 'lucide-react'

const CreateServerModal = ({ isOpen, onClose, onServerCreated }) => {
  const [step, setStep] = useState('welcome')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Gaming',
    isPublic: true,
    icon: null,
  })
  const [iconPreview, setIconPreview] = useState(null)

  const categories = [
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-100', text: 'text-purple-600' },
    { id: 'Study', label: 'Study', icon: BookOpen, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-600' },
    { id: 'Music', label: 'Music', icon: Music, color: 'from-green-500 to-emerald-500', bg: 'bg-green-100', text: 'text-green-600' },
    { id: 'Tech', label: 'Tech', icon: Shield, color: 'from-gray-700 to-gray-900', bg: 'bg-gray-100', text: 'text-gray-600' },
    { id: 'Art', label: 'Art', icon: Palette, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-100', text: 'text-pink-600' },
    { id: 'Sports', label: 'Sports', icon: Trophy, color: 'from-orange-500 to-red-500', bg: 'bg-orange-100', text: 'text-orange-600' },
    { id: 'Social', label: 'Social', icon: Users, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-100', text: 'text-indigo-600' },
    { id: 'Other', label: 'Other', icon: Coffee, color: 'from-stone-500 to-stone-700', bg: 'bg-stone-100', text: 'text-stone-600' },
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

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setIconPreview(reader.result)
    }
    reader.readAsDataURL(file)
    setFormData({ ...formData, icon: file })
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

      const { data } = await serverApi.createServer(formDataToSend)
      showToast.success('✨ Server created successfully!')
      onServerCreated?.(data.server)
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'Gaming',
        isPublic: true,
        icon: null,
      })
      setIconPreview(null)
      setStep('welcome')
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create server')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === formData.category)
  const CategoryIcon = selectedCategory?.icon || Gamepad2

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title=""
      size="lg"
    >
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {step === 'welcome' && (
            <div className="p-8">
              {/* Animated Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles size={40} className="text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Your Server
              </h2>
              <p className="text-gray-600 text-center mb-8 max-w-md mx-auto">
                Bring your community together! Create a space for your friends, gaming team, or study group.
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all transform hover:scale-105">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Unlimited Members</h3>
                  <p className="text-xs text-gray-500 mt-1">Grow your community</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all transform hover:scale-105">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield size={24} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Custom Roles</h3>
                  <p className="text-xs text-gray-500 mt-1">Organize your team</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all transform hover:scale-105">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gamepad2 size={24} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Play Games</h3>
                  <p className="text-xs text-gray-500 mt-1">Multiplayer fun</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all transform hover:scale-105">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe size={24} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Voice Channels</h3>
                  <p className="text-xs text-gray-500 mt-1">Talk in real-time</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('details')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  icon={<ChevronRight size={18} />}
                  iconPosition="right"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Server Details</h2>
              
              <div className="space-y-6">
                {/* Server Icon Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {iconPreview ? (
                      <div className="relative group">
                        <img
                          src={iconPreview}
                          alt="Server icon"
                          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveIcon}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        <Camera size={24} className="text-gray-400" />
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
                      className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Upload size={14} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Server Icon</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a logo to make your server stand out
                    </p>
                  </div>
                </div>

                {/* Server Name */}
                <Input
                  label="Server Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Gaming Paradise"
                  required
                  autoFocus
                  className="bg-white/50 backdrop-blur-sm"
                />

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none"
                    placeholder="What's your server about? e.g., A place for gamers to hang out and play together..."
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Server Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      const isSelected = formData.category === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`
                            flex items-center space-x-3 p-3 rounded-xl border-2 transition-all
                            ${isSelected 
                              ? `border-transparent bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                              : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/80'
                            }
                          `}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : cat.bg}`}>
                            <Icon size={18} className={isSelected ? 'text-white' : cat.text} />
                          </div>
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                            {cat.label}
                          </span>
                          {isSelected && <Check size={16} className="ml-auto text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Privacy Setting */}
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isPublic ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform top-1 ${formData.isPublic ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        {formData.isPublic ? (
                          <Globe size={18} className="text-blue-600 mr-2" />
                        ) : (
                          <Lock size={18} className="text-gray-500 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">
                          {formData.isPublic ? 'Public Server' : 'Private Server'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.isPublic 
                          ? 'Anyone can discover and join your server'
                          : 'Only people with an invite link can join'
                        }
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Preview</h3>
                  <div className="flex items-center space-x-4">
                    {iconPreview ? (
                      <img
                        src={iconPreview}
                        alt="Server"
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CategoryIcon size={24} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{formData.name || 'Server Name'}</h4>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {formData.description || 'No description yet'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${formData.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {formData.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('welcome')}
                >
                  Back
                </Button>
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    icon={<Sparkles size={18} />}
                  >
                    Create Server
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default CreateServerModal