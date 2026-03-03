import { useState, useRef } from 'react'
import { Send, Smile, Paperclip, X } from 'lucide-react'
import Button from '../ui/Button'
import { showToast } from '../ui/Toast'

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setMessage(e.target.value)
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true)
      onTyping?.(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTyping?.(false)
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim() && attachments.length === 0) {
      return
    }

    try {
      await onSendMessage({
        text: message.trim(),
        attachments: attachments
      })
      
      setMessage('')
      setAttachments([])
      setIsTyping(false)
      onTyping?.(false)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    } catch (error) {
      showToast.error('Failed to send message')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file size (max 5MB)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    // Create preview URLs
    const newAttachments = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))

    setAttachments([...attachments, ...newAttachments])
  }

  const removeAttachment = (index) => {
    URL.revokeObjectURL(attachments[index].preview)
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={file.preview}
                alt={file.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                  opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Attachment Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip size={20} />
        </Button>

        {/* Message Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select a channel to start chatting" : "Message #channel..."}
            disabled={disabled}
            rows="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none
              disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Emoji Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
        >
          <Smile size={20} />
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
        >
          <Send size={18} />
        </Button>
      </form>

      {/* Character Count (optional) */}
      {message.length > 1800 && (
        <p className="text-xs text-yellow-600 mt-1 text-right">
          {message.length}/2000 characters
        </p>
      )}
    </div>
  )
}

export default MessageInput