import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import { showToast } from '../components/ui/Toast'
import { Bell, Moon, Sun, Volume2, Shield, Eye, Globe, LogOut } from 'lucide-react'

const SettingsPage = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: isDark ? Moon : Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'audio', label: 'Audio & Video', icon: Volume2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'language', label: 'Language', icon: Globe },
  ]

  const handleLogout = async () => {
    await logout()
    showToast.success('Logged out successfully')
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            )
          })}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-8">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${isDark ? 'bg-blue-600' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                      ${isDark ? 'right-1' : 'left-1'}
                    `}
                  />
                </button>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Compact Mode</p>
                  <p className="text-sm text-gray-600">Show more messages in less space</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
              
              {/* Notification Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Friend Requests</p>
                    <p className="text-sm text-gray-600">Get notified when someone sends you a friend request</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Messages</p>
                    <p className="text-sm text-gray-600">Get notified for new messages</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Game Invites</p>
                    <p className="text-sm text-gray-600">Get notified when someone invites you to play</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mentions</p>
                    <p className="text-sm text-gray-600">Get notified when someone mentions you</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Audio & Video</h2>
              <p className="text-gray-600">Audio settings coming soon...</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Who can send you friend requests</p>
                    <p className="text-sm text-gray-600">Everyone</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Everyone</option>
                    <option>Friends of Friends</option>
                    <option>No One</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Who can message you</p>
                    <p className="text-sm text-gray-600">Friends Only</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Everyone</option>
                    <option>Friends Only</option>
                    <option>No One</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Accessibility</h2>
              <p className="text-gray-600">Accessibility settings coming soon...</p>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Language</h2>
              
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage