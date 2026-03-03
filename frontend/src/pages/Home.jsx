import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-white">Nexora</h1>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="secondary">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="secondary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="text-center text-white max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">
            Connect, Chat, and Play with Friends
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join communities, create servers, play multiplayer games, and make new friends in real-time.
          </p>
          
          {!isAuthenticated && (
            <Link to="/signup">
              <Button size="lg" variant="secondary">
                Get Started Free
              </Button>
            </Link>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-blue-100">Instant messaging in channels and DMs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">Multiplayer Games</h3>
              <p className="text-blue-100">Play Tic-Tac-Toe and more with friends</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Communities</h3>
              <p className="text-blue-100">Create servers and channels for any topic</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home