import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { ArrowLeft, Users, RotateCcw } from 'lucide-react'

const GamePage = () => {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [board, setBoard] = useState(Array(9).fill(''))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [winner, setWinner] = useState(null)
  const [players, setPlayers] = useState([
    { id: user?._id, name: user?.username, symbol: 'X' },
    { id: 'opponent', name: 'Waiting...', symbol: 'O' }
  ])

  const handleCellClick = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    // Check winner
    const winPatterns = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ]

    for (let pattern of winPatterns) {
      const [a,b,c] = pattern
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinner(currentPlayer)
        break
      }
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
  }

  const resetGame = () => {
    setBoard(Array(9).fill(''))
    setCurrentPlayer('X')
    setWinner(null)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Games
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Tic Tac Toe</h1>
      </div>

      {/* Players */}
      <div className="flex items-center justify-between mb-8 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {players[0].name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{players[0].name}</p>
              <p className="text-sm text-gray-600">Player X</p>
            </div>
          </div>
          <Users size={20} className="text-gray-400" />
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
              ?
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{players[1].name}</p>
              <p className="text-sm text-gray-600">Player O</p>
            </div>
          </div>
        </div>
        <Button onClick={resetGame} variant="outline" icon={<RotateCcw size={18} />}>
          Reset
        </Button>
      </div>

      {/* Game Board */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {winner ? (
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-green-600">
              Player {winner} wins! 🎉
            </p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <p className="text-xl text-gray-700">
              Current turn: Player {currentPlayer}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner}
              className={`
                aspect-square text-4xl font-bold rounded-lg border-2
                ${cell 
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                  : 'bg-white border-blue-300 hover:bg-blue-50'
                }
                ${winner ? 'cursor-not-allowed' : ''}
              `}
            >
              <span className={cell === 'X' ? 'text-blue-600' : 'text-red-600'}>
                {cell}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Game Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Share this game link with a friend to play together</p>
        <p className="mt-2 font-mono text-xs bg-gray-100 p-2 rounded">
          {window.location.origin}/games/{gameId}
        </p>
      </div>
    </div>
  )
}

export default GamePage