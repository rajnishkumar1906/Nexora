import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import DMList from '../components/dm/DMList'
import DMChat from '../components/dm/DMChat'
import { Menu, MessageCircle, Users, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'

const DMPage = () => {
  const { chatId } = useParams()
  const [showSidebar, setShowSidebar] = useState(true)

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
      >
        <Menu size={20} />
      </button>

      {/* DM List Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <DMList />
      </div>

      {/* DM Chat Area */}
      <div className="flex-1 overflow-hidden">
        {chatId ? (
          <DMChat />
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              {/* Animated Illustration */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0ms' }}>
                      <MessageCircle size={32} className="text-blue-600" />
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '150ms' }}>
                      <Users size={32} className="text-purple-600" />
                    </div>
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '300ms' }}>
                      <MessageCircle size={32} className="text-pink-600" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    No conversations yet
                  </h2>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    Start a new conversation with your friends and start chatting in real-time!
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={() => setShowSidebar(true)}
                      className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all"
                    >
                      Open Conversations
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {/* Open find friends modal */}}
                      className="border-2 hover:bg-gray-50 transform hover:scale-105 transition-all"
                    >
                      Find Friends
                    </Button>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle size={24} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Chat</h3>
                  <p className="text-sm text-gray-600">
                    Instant messaging with typing indicators and read receipts
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Users size={24} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Group DMs</h3>
                  <p className="text-sm text-gray-600">
                    Chat with multiple friends at once in group conversations
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Media Sharing</h3>
                  <p className="text-sm text-gray-600">
                    Share images, files, and links with your friends
                  </p>
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Click the + button in the sidebar to start a new conversation
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    You can only message users who are your friends
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Green dot indicates online friends
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DMPage