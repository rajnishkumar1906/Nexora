import { useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { Trophy, RotateCcw, X } from 'lucide-react'

const GameStatus = ({ game, currentUser, onRematch, onClose }) => {
  const [requestingRematch, setRequestingRematch] = useState(false)

  if (!game) return null

  const isGameOver = game.status === 'completed'
  const winner = game.winner
  const isDraw = isGameOver && !winner
  const isWinner = winner?._id === currentUser?._id
  const isLoser = isGameOver && !isDraw && !isWinner

  const player1 = game.players?.[0]
  const player2 = game.players?.[1]

  const getPlayerScore = (player) => {
    return player?.score || 0
  }

  const handleRematch = async () => {
    setRequestingRematch(true)
    await onRematch?.()
    setRequestingRematch(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy size={20} className="mr-2 text-yellow-500" />
          Game Status
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Players */}
      <div className="space-y-4 mb-6">
        {/* Player 1 */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          winner?._id === player1?.user?._id ? 'bg-yellow-50 border border-yellow-200' : ''
        }`}>
          <div className="flex items-center space-x-3">
            <Avatar
              src={player1?.user?.avatar}
              name={player1?.user?.username}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900">{player1?.user?.username}</p>
              <p className="text-xs text-gray-500">Player X</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Score: {getPlayerScore(player1)}
            </span>
            {winner?._id === player1?.user?._id && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Winner
              </span>
            )}
          </div>
        </div>

        {/* Player 2 */}
        {player2 && (
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            winner?._id === player2?.user?._id ? 'bg-yellow-50 border border-yellow-200' : ''
          }`}>
            <div className="flex items-center space-x-3">
              <Avatar
                src={player2?.user?.avatar}
                name={player2?.user?.username}
                size="md"
              />
              <div>
                <p className="font-medium text-gray-900">{player2?.user?.username}</p>
                <p className="text-xs text-gray-500">Player O</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Score: {getPlayerScore(player2)}
              </span>
              {winner?._id === player2?.user?._id && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Winner
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Game Result */}
      {isGameOver && (
        <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
          {isDraw ? (
            <>
              <p className="text-lg font-semibold text-gray-700 mb-2">It's a Draw!</p>
              <p className="text-sm text-gray-500">Well played both!</p>
            </>
          ) : isWinner ? (
            <>
              <p className="text-lg font-semibold text-green-600 mb-2">You Won! 🎉</p>
              <p className="text-sm text-gray-500">Great job!</p>
            </>
          ) : isLoser ? (
            <>
              <p className="text-lg font-semibold text-gray-700 mb-2">Better luck next time!</p>
              <p className="text-sm text-gray-500">{winner?.username} played well</p>
            </>
          ) : null}
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        {isGameOver && (
          <Button
            onClick={handleRematch}
            loading={requestingRematch}
            className="flex-1"
            icon={<RotateCcw size={18} />}
          >
            Rematch
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
      </div>

      {/* Rematch Status */}
      {game.rematchVotes?.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {game.rematchVotes.length === 1 
              ? 'Waiting for opponent to accept rematch...'
              : 'Rematch accepted! Starting new game...'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default GameStatus