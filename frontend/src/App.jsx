import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ServerProvider } from './context/ServerContext'
import { ChannelProvider } from './context/ChannelContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ServerPage from './pages/ServerPage'
import ChannelPage from './pages/ChannelPage'
import GamePage from './pages/GamePage'
import GamesListPage from './pages/GamesListPage'
import ProfilePage from './pages/ProfilePage'
import FriendsPage from './pages/FriendsPage'
import DMPage from './pages/DMPage'
import DiscoverPage from './pages/DiscoverPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import NotFound from './pages/404'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import ServerLayout from './components/layout/ServerLayout'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ServerProvider>
              <ChannelProvider>
                <ToastContainer position="top-right" autoClose={3000} />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Protected Routes with MainLayout */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/profile/:userId" element={<ProfilePage />} />
                      <Route path="/friends" element={<FriendsPage />} />
                      <Route path="/games" element={<GamesListPage />} />
                      <Route path="/games/:gameId" element={<GamePage />} />
                      <Route path="/discover" element={<DiscoverPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                  </Route>

                  {/* Server Routes with ServerLayout */}
                  <Route element={<ProtectedRoute />}>
                      <Route path="/servers/:serverId" element={<ServerPage />}>
                      <Route path="channels/:channelId" element={<ChannelPage />} />
                    </Route>
                  </Route>

                  {/* DM Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dm" element={<DMPage />} />
                    <Route path="/dm/:chatId" element={<DMPage />} />
                  </Route>
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ChannelProvider>
            </ServerProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App