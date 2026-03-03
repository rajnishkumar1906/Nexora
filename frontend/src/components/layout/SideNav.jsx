import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Users, 
  MessageCircle, 
  Bell, 
  Settings,
  Compass,
  Gamepad2,
  User,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import LogoutConfirmModal from '../ui/LogoutConfirmModal' // or SimpleLogoutModal

const SideNav = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/dm', icon: MessageCircle, label: 'Messages' },
    { path: '/games', icon: Gamepad2, label: 'Games' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleLogout = async () => {
    await logout()
    setShowLogoutModal(false)
    navigate('/')
  }

  return (
    <>
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Nexora
          </h1>
          <p className="text-xs text-gray-400 mt-1">Connect • Chat • Play</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <NavLink
              to="/profile"
              className="flex items-center hover:bg-gray-700 rounded-xl p-2 transition-colors"
            >
              <Avatar
                src={user?.avatar}
                name={user?.username}
                size="sm"
                status={user?.status}
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </NavLink>
            
            <button
              onClick={() => setShowLogoutModal(true)}
              className="mt-2 w-full flex items-center justify-center px-4 py-2.5 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-xl transition-all group"
            >
              <LogOut size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        message="Ready to leave Nexora?"
      />
    </>
  )
}

export default SideNav