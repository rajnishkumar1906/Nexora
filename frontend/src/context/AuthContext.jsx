import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

export const AuthContext = createContext()  // Add this export

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data } = await authApi.getMe()
      setUser(data.user)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setError(null)
      const { data } = await authApi.signup(userData)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
      return { success: false, error: err.response?.data?.message }
    }
  }

  const login = async (credentials) => {
    try {
      setError(null)
      const { data } = await authApi.login(credentials)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      return { success: false, error: err.response?.data?.message }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
  }

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    checkAuth,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}