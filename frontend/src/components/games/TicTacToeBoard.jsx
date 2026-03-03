import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { gameApi } from '../../api/gameApi'
import { showToast } from '../ui/Toast'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'

const TicTacToeBoard = ({ gameId, game, onMove, onGameEnd }) => {
  const { user } = useAuth()
  const [board, setBoard] = useState(game?.board || Array(9).fill(''))
  const [winner, setWinner] = useState(game?.winner || null)
  const [winningLine, setWinningLine] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(game?.currentTurn)

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ]

  useEffect(() => {
    if (game) {
      setBoard(game.board)
      setWinner(game.winner)
      setCurrentPlayer(game.currentTurn)
      
      // Check for winner
      if (game.winner || !game.board.includes('')) {
        findWinningLine(game.board)
      }
    }
  }, [game])

  const findWinningLine = (currentBoard) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern
      if (currentBoard[a] && 
          currentBoard[a] === currentBoard[b] && 
          currentBoard[a] === currentBoard[c]) {
        setWinningLine(pattern)
        break
      }
    }
  }

  const checkWinner = (newBoard) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern
      if (newBoard[a] && 
          newBoard[a] === newBoard[b] && 
          newBoard[a] === newBoard[c]) {
        return { winner: newBoard[a], line: pattern }
      }
    }
    return null
  }

  const handleCellClick = async (index) => {
    if (board[index] || winner) return
    
    // Check if it's user's turn
    const isPlayer1 = game?.players[0]?.user?._id === user?._id
    const isPlayer2 = game?.players[1]?.user?._id === user?._id
    
    if (!isPlayer1 && !isPlayer2) {
      showToast.error('You are not a player in this game')
      return
    }

    const currentSymbol = isPlayer1 ? 'X' : 'O'
    const isMyTurn = currentPlayer === user?._id

    if (!isMyTurn) {
      showToast.error('Not your turn')
      return
    }

    // Make move
    const newBoard = [...board]
    newBoard[index] = currentSymbol
    setBoard(newBoard)

    const result = checkWinner(newBoard)
    
    if (result) {
      setWinner(result.winner)
      setWinningLine(result.line)
      onGameEnd?.({
        winner: result.winner === 'X' ? game?.players[0]?.user : game?.players[1]?.user,
        message: 'Game Over!'
      })
    } else if (!newBoard.includes('')) {
      // Draw
      setWinner('draw')
      onGameEnd?.({
        winner: null,
        message: "It's a draw!"
      })
    }

    // Send move to server
    await onMove?.(index)
  }

  const getCellStyle = (index) => {
    if (winningLine.includes(index)) {
      return 'bg-green-200 border-green-500'
    }
    return 'bg-white hover:bg-gray-50 border-gray-300'
  }

  const getPlayerSymbol = (player) => {
    if (!player) return null
    return game?.players[0]?.user?._id === player ? 'X' : 'O'
  }

  const isMyTurn = currentPlayer === user?._id

  return (
    <div className="flex flex-col items-center p-6">
      {/* Game Header */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-4">
          {/* Player 1 */}
          <div className="flex items-center space-x-3">
            <Avatar
              src={game?.players[0]?.user?.avatar}
              name={game?.players[0]?.user?.username}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900">
                {game?.players[0]?.user?.username}
              </p>
              <p className="text-xs text-gray-500">Player X</p>
            </div>
            {currentPlayer === game?.players[0]?.user?._id && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Your turn
              </span>
            )}
          </div>

          <span className="text-xl font-bold text-gray-400">VS</span>

          {/* Player 2 */}
          <div className="flex items-center space-x-3">
            {game?.players[1] ? (
              <>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {game?.players[1]?.user?.username}
                  </p>
                  <p className="text-xs text-gray-500">Player O</p>
                </div>
                <Avatar
                  src={game?.players[1]?.user?.avatar}
                  name={game?.players[1]?.user?.username}
                  size="md"
                />
                {currentPlayer === game?.players[1]?.user?._id && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Your turn
                  </span>
                )}
              </>
            ) : (
              <div className="text-right">
                <p className="font-medium text-gray-900">Waiting...</p>
                <p className="text-xs text-gray-500">Player O</p>
              </div>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center">
          {winner ? (
            <p className="text-lg font-semibold text-gray-900">
              {winner === 'draw' 
                ? "It's a draw!" 
                : `${winner === 'X' ? game?.players[0]?.user?.username : game?.players[1]?.user?.username} wins!`
              }
            </p>
          ) : (
            <p className="text-lg text-gray-700">
              {game?.players?.length < 2 
                ? 'Waiting for opponent to join...'
                : isMyTurn 
                  ? 'Your turn!' 
                  : `${game?.players?.find(p => p.user?._id === currentPlayer)?.user?.username}'s turn`
              }
            </p>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !!winner || game?.players?.length < 2 || !isMyTurn}
            className={`
              aspect-square border-2 rounded-lg text-4xl font-bold
              transition-all duration-200
              ${getCellStyle(index)}
              ${!cell && !winner && game?.players?.length === 2 && isMyTurn
                ? 'cursor-pointer hover:scale-105' 
                : 'cursor-not-allowed opacity-70'
              }
            `}
          >
            <span className={cell === 'X' ? 'text-blue-600' : 'text-red-600'}>
              {cell}
            </span>
          </button>
        ))}
      </div>

      {/* Game Info */}
      <div className="mt-8 text-sm text-gray-500">
        {game?.players?.length < 2 ? (
          <p>Share this game link with a friend to play</p>
        ) : (
          <p>Click any empty cell to place your {isMyTurn ? 'mark' : 'mark when it\'s your turn'}</p>
        )}
      </div>
    </div>
  )
}

export default TicTacToeBoard