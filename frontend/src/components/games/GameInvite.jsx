import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import { gameApi } from '../../api/gameApi'
import { friendApi } from '../../api/friendApi'
import { showToast } from '../ui/Toast'
import { Gamepad2, Users, X } from 'lucide-react'

const GameInvite = ({ isOpen, onClose, channelId, onGameStarted }) => {
  const [step, setStep] = useState('select') // select, inviting, started
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [gameType, setGameType] = useState('tictactoe')
  const [inviteMessage, setInviteMessage] = useState('')

  const gameTypes = [
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌', description: 'Classic 3x3 game' },
    { id: 'rockpaperscissors', name: 'Rock Paper Scissors', icon: '✂️', description: 'Coming soon', disabled: true },
  ]

  useState(() => {
    if (isOpen) {
      loadFriends()
    }
  }, [isOpen])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const { data } = await friendApi.getFriends()
      setFriends(data.friends?.filter(f => f.status === 'online') || [])
    } catch (error) {
      showToast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!selectedFriend) return

    setStep('inviting')
    try {
      // Start game with selected friend
      const { data } = await gameApi.startGame(channelId, gameType)
      
      // Send invite notification (you'll need to implement this)
      // await notificationApi.sendGameInvite(selectedFriend._id, data.game._id)
      
      setStep('started')
      onGameStarted?.(data.game)
      showToast.success(`Invite sent to ${selectedFriend.username}`)
    } catch (error) {
      showToast.error('Failed to start game')
      setStep('select')
    }
  }

  const handleCopyLink = () => {
    const gameLink = `${window.location.origin}/games/${gameId}`
    navigator.clipboard.writeText(gameLink)
    showToast.success('Game link copied!')
  }

  if (step === 'started') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Game Started!">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gamepad2 size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Game Created!
          </h3>
          <p className="text-gray-600 mb-6">
            Waiting for {selectedFriend?.username} to join...
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={onClose}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite to Game" size="lg">
      <div className="space-y-6">
        {/* Game Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Game
          </label>
          <div className="grid grid-cols-2 gap-3">
            {gameTypes.map((game) => (
              <button
                key={game.id}
                onClick={() => setGameType(game.id)}
                disabled={game.disabled}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all
                  ${gameType === game.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${game.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                `}
              >
                <div className="text-3xl mb-2">{game.icon}</div>
                <div className="font-medium text-gray-900">{game.name}</div>
                <div className="text-xs text-gray-500">{game.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Friend Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Friend to Invite
          </label>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : friends.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => setSelectedFriend(friend)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg transition-colors
                    ${selectedFriend?._id === friend._id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={friend.avatar}
                      name={friend.username}
                      size="sm"
                      status={friend.status}
                    />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{friend.username}</p>
                      <p className="text-xs text-green-600">🟢 Online</p>
                    </div>
                  </div>
                  {selectedFriend?._id === friend._id && (
                    <span className="text-blue-600 text-sm">Selected</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">No friends online</p>
              <p className="text-sm text-gray-500">
                Invite friends to play or wait for them to come online
              </p>
            </div>
          )}
        </div>

        {/* Optional Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a message (optional)
          </label>
          <textarea
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
            placeholder="Want to play Tic Tac Toe?"
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={!selectedFriend}
            loading={step === 'inviting'}
          >
            Send Invite
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GameInvite