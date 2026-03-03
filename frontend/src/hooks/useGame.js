import { useState, useEffect } from 'react'
import { useSocket } from './useSocket'
import { gameApi } from '../api/gameApi'
import { showToast } from '../components/ui/Toast'

export const useGame = (gameId) => {
  const { socket } = useSocket()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (gameId) {
      loadGame()
      joinGameRoom()

      return () => {
        leaveGameRoom()
      }
    }
  }, [gameId])

  useEffect(() => {
    if (!socket) return

    socket.on('gameUpdated', handleGameUpdate)
    socket.on('gameEnded', handleGameEnd)
    socket.on('playerJoined', handlePlayerJoined)
    socket.on('gameMessage', handleGameMessage)

    return () => {
      socket.off('gameUpdated', handleGameUpdate)
      socket.off('gameEnded', handleGameEnd)
      socket.off('playerJoined', handlePlayerJoined)
      socket.off('gameMessage', handleGameMessage)
    }
  }, [socket])

  const loadGame = async () => {
    try {
      setLoading(true)
      const { data } = await gameApi.getGameState(gameId)
      setGame(data.game)
    } catch (err) {
      setError('Failed to load game')
      showToast.error('Failed to load game')
    } finally {
      setLoading(false)
    }
  }

  const handleGameUpdate = (updatedGame) => {
    if (updatedGame._id === gameId) {
      setGame(updatedGame)
    }
  }

  const handleGameEnd = ({ gameId: endedGameId, winner, message }) => {
    if (endedGameId === gameId) {
      setGame(prev => ({ ...prev, status: 'completed', winner }))
      showToast.info(message || 'Game ended')
    }
  }

  const handlePlayerJoined = ({ gameId: joinedGameId, player }) => {
    if (joinedGameId === gameId) {
      setGame(prev => ({
        ...prev,
        players: [...(prev?.players || []), player]
      }))
    }
  }

  const handleGameMessage = ({ userId, username, message, timestamp }) => {
    // Handle game chat messages
    console.log('Game message:', { userId, username, message, timestamp })
  }

  const joinGameRoom = () => {
    socket?.emit('joinGame', gameId)
  }

  const leaveGameRoom = () => {
    socket?.emit('leaveGame', gameId)
  }

  const makeMove = async (position, move = null) => {
    try {
      await gameApi.makeMove(gameId, position, move)
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to make move')
      throw err
    }
  }

  const joinGame = async () => {
    try {
      const { data } = await gameApi.joinGame(gameId)
      setGame(data.game)
      showToast.success('Joined game')
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to join game')
      throw err
    }
  }

  const rematch = async () => {
    try {
      const { data } = await gameApi.rematch(gameId)
      setGame(data.game)
      showToast.success('Rematch started')
    } catch (err) {
      showToast.error('Failed to start rematch')
      throw err
    }
  }

  const sendMessage = (message) => {
    socket?.emit('gameChat', { gameId, message })
  }

  const isPlayer = game?.players?.some(p => p.user?._id === currentUser?._id)
  const isMyTurn = game?.currentTurn === currentUser?._id
  const isGameOver = game?.status === 'completed'
  const isWaiting = game?.status === 'waiting'

  return {
    game,
    loading,
    error,
    isPlayer,
    isMyTurn,
    isGameOver,
    isWaiting,
    makeMove,
    joinGame,
    rematch,
    sendMessage,
    refresh: loadGame,
  }
}