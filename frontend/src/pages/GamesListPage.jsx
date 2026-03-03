import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { Gamepad2, Users, Clock, Trophy, Plus } from 'lucide-react'

const GamesListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'Classic 3x3 game. Get three in a row to win!',
      icon: '❌',
      players: 2,
      timeEstimate: '5 min',
      category: 'classic',
      popular: true
    },
    {
      id: 'rockpaperscissors',
      name: 'Rock Paper Scissors',
      description: 'Simple hand game. Rock beats scissors, scissors beats paper, paper beats rock.',
      icon: '✂️',
      players: 2,
      timeEstimate: '2 min',
      category: 'classic',
      comingSoon: true
    },
    {
      id: 'chess',
      name: 'Chess',
      description: 'Strategic board game. Coming soon!',
      icon: '♜',
      players: 2,
      timeEstimate: '20-30 min',
      category: 'strategy',
      comingSoon: true
    }
  ]

  const recentGames = [
    { id: 1, game: 'Tic Tac Toe', opponent: 'john_doe', result: 'win', date: '2 hours ago' },
    { id: 2, game: 'Tic Tac Toe', opponent: 'jane_smith', result: 'loss', date: 'yesterday' },
  ]

  const filteredGames = activeTab === 'all' 
    ? games 
    : activeTab === 'popular' 
      ? games.filter(g => g.popular)
      : games.filter(g => g.category === activeTab)

  const handlePlayGame = (gameId) => {
    // Navigate to game lobby or create game
    if (gameId === 'tictactoe') {
      // For now, just navigate to a sample game
      navigate('/games/sample-game-id')
    } else {
      // Show coming soon message
      alert(`${gameId} is coming soon!`)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Games</h1>
          <p className="text-gray-600 mt-2">
            Play multiplayer games with your friends
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 mb-8">
          {[
            { id: 'all', label: 'All Games' },
            { id: 'popular', label: 'Popular' },
            { id: 'recent', label: 'Recent' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors relative
                ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {activeTab !== 'recent' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl">{game.icon}</span>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {game.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      <span>{game.players} players</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>{game.timeEstimate}</span>
                    </div>
                  </div>

                  {game.comingSoon ? (
                    <Button variant="outline" fullWidth disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePlayGame(game.id)}
                      fullWidth
                      icon={<Gamepad2 size={18} />}
                    >
                      Play Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Recent Games Tab
          <div className="bg-white rounded-lg shadow-md">
            {recentGames.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentGames.map((game) => (
                  <div key={game.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        game.result === 'win' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Trophy size={18} className={game.result === 'win' ? 'text-green-600' : 'text-red-600'} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{game.game}</p>
                        <p className="text-sm text-gray-600">vs {game.opponent}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        game.result === 'win' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {game.result === 'win' ? 'Won' : 'Lost'}
                      </span>
                      <p className="text-xs text-gray-500">{game.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent games</h3>
                <p className="text-gray-600 mb-6">
                  Play some games to see your history here
                </p>
                <Button onClick={() => setActiveTab('all')}>
                  Browse Games
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Invite Friend Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => {/* Open invite modal */}}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center"
            title="Invite Friend to Play"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default GamesListPage