import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from './useAuth'
import { serverApi } from '../api/serverApi'
import { channelApi } from '../api/channelApi'
import { showToast } from '../components/ui/Toast'

export const useServer = (serverId) => {
  const { user } = useAuth()
  const [server, setServer] = useState(null)
  const [channels, setChannels] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (serverId) {
      loadServer()
      loadChannels()
      loadMembers()
    }
  }, [serverId])

  const loadServer = async () => {
    try {
      const { data } = await serverApi.getServer(serverId)
      setServer(data.server)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load server')
      showToast.error('Failed to load server')
    }
  }

  const loadChannels = async () => {
    try {
      const { data } = await channelApi.getChannels(serverId)
      setChannels(data.channels || [])
    } catch (err) {
      showToast.error('Failed to load channels')
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const { data } = await serverApi.getMembers(serverId)
      setMembers(data.members || [])
    } catch (err) {
      console.error('Failed to load members')
    }
  }

  const createChannel = async (channelData) => {
    try {
      const { data } = await channelApi.createChannel(serverId, channelData)
      setChannels(prev => [...prev, data.channel])
      showToast.success('Channel created')
      return data.channel
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to create channel')
      throw err
    }
  }

  const updateChannel = async (channelId, channelData) => {
    try {
      const { data } = await channelApi.updateChannel(channelId, channelData)
      setChannels(prev => prev.map(ch => ch._id === channelId ? data.channel : ch))
      showToast.success('Channel updated')
      return data.channel
    } catch (err) {
      showToast.error('Failed to update channel')
      throw err
    }
  }

  const deleteChannel = async (channelId) => {
    try {
      await channelApi.deleteChannel(channelId)
      setChannels(prev => prev.filter(ch => ch._id !== channelId))
      showToast.success('Channel deleted')
    } catch (err) {
      showToast.error('Failed to delete channel')
      throw err
    }
  }

  const updateServer = async (serverData) => {
    try {
      const { data } = await serverApi.updateServer(serverId, serverData)
      setServer(data.server)
      showToast.success('Server updated')
      return data.server
    } catch (err) {
      showToast.error('Failed to update server')
      throw err
    }
  }

  const deleteServer = async () => {
    try {
      await serverApi.deleteServer(serverId)
      showToast.success('Server deleted')
    } catch (err) {
      showToast.error('Failed to delete server')
      throw err
    }
  }

  const leaveServer = async () => {
    try {
      await serverApi.leaveServer(serverId)
      showToast.success('Left server')
    } catch (err) {
      showToast.error('Failed to leave server')
      throw err
    }
  }

  const updateMemberRole = async (memberId, role) => {
    try {
      await serverApi.updateMemberRole(serverId, memberId, role)
      setMembers(prev => prev.map(m => 
        m._id === memberId ? { ...m, role } : m
      ))
      showToast.success('Role updated')
    } catch (err) {
      showToast.error('Failed to update role')
      throw err
    }
  }

  const isOwner = server?.owner === user?._id
  const isAdmin = isOwner || server?.role === 'admin'

  return {
    server,
    channels,
    members,
    loading,
    error,
    isOwner,
    isAdmin,
    createChannel,
    updateChannel,
    deleteChannel,
    updateServer,
    deleteServer,
    leaveServer,
    updateMemberRole,
    refresh: loadServer,
  }
}