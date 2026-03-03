import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { LogOut, X } from 'lucide-react'

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <LogOut size={32} className="text-white" />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {message || 'Ready to leave?'}
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-xs mx-auto">
          You'll need to log back in to access your servers, messages, and games.
        </p>

        {/* Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-3 border-2 hover:bg-gray-50"
            icon={<X size={18} />}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            icon={<LogOut size={18} />}
          >
            Logout
          </Button>
        </div>

        {/* Security Note */}
        <p className="text-xs text-gray-400 mt-4 flex items-center justify-center">
          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
          Your session will be securely ended
          <span className="w-1 h-1 bg-gray-400 rounded-full ml-2"></span>
        </p>
      </div>
    </Modal>
  )
}

export default LogoutConfirmModal