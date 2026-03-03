import { useState, useRef } from 'react'
import { Upload, X, Camera } from 'lucide-react'

const AvatarUpload = ({ currentImage, onImageChange, onRemove, type = 'avatar' }) => {
  const [preview, setPreview] = useState(currentImage)
  const [isHovered, setIsHovered] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    onImageChange(file, previewUrl)
  }

  const handleRemove = () => {
    setPreview(null)
    onRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sizeClasses = type === 'avatar' 
    ? 'w-24 h-24' 
    : 'w-full h-32'

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Image Preview */}
      {preview ? (
        <div className={`${sizeClasses} rounded-full overflow-hidden relative`}>
          <img
            src={preview}
            alt="Avatar preview"
            className="w-full h-full object-cover"
          />
          
          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 bg-white rounded-full hover:bg-gray-100"
                title="Change"
              >
                <Camera size={16} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 bg-white rounded-full hover:bg-gray-100"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Upload Placeholder
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`${sizeClasses} rounded-full border-2 border-dashed border-gray-300 
            flex flex-col items-center justify-center hover:border-blue-500 
            hover:bg-blue-50 transition-colors`}
        >
          <Upload size={type === 'avatar' ? 20 : 24} className="text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">Upload</span>
        </button>
      )}
    </div>
  )
}

export default AvatarUpload