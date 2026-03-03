import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { serverApi } from '../../api/serverApi'
import { showToast } from '../ui/Toast'
import { Hash, Users, Globe, Lock } from 'lucide-react'

const JoinServerModal = ({ isOpen, onClose, onServerJoined }) => {
  const [step, setStep] = useState('invite') // invite, preview, joined
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [server, setServer] = useState(null)

  const handleLookup = async () => {
    if (!inviteCode.trim()) return

    setLoading(true)
    try {
      const { data } = await serverApi.getServerByInvite(inviteCode)
      setServer(data.server)
      setStep('preview')
    } catch (error) {
      showToast.error('Invalid invite code')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    setLoading(true)
    try {
      await serverApi.joinServer(inviteCode)
      setStep('joined')
      onServerJoined?.(server)
      showToast.success(`Joined ${server.name}`)
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to join server')
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep('invite')
    setInviteCode('')
    setServer(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (step === 'joined') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Joined Server!">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            You've joined {server?.name}!
          </h3>
          <p className="text-gray-600 mb-6">
            Start chatting and exploring the channels.
          </p>
          <div className="flex justify-center">
            <Button onClick={handleClose}>
              Go to Server
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join a Server">
      <div className="space-y-4">
        {step === 'invite' ? (
          <>
            <p className="text-sm text-gray-600">
              Enter an invite code to join an existing server.
            </p>

            <Input
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              icon={<Hash size={18} />}
              autoFocus
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Where to find an invite?
              </h4>
              <p className="text-xs text-blue-600">
                Server admins can share invite links. You can also discover public servers in the Discover page.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleLookup}
                loading={loading}
              >
                Look Up
              </Button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep('invite')}
              className="text-sm text-blue-600 hover:text-blue-700 mb-2"
            >
              ← Enter different code
            </button>

            {/* Server Preview */}
            {server && (
              <div className="border rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {server.icon ? (
                    <img
                      src={server.icon}
                      alt={server.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                      {server.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{server.name}</h3>
                    <p className="text-sm text-gray-600">
                      Owned by {server.owner?.username}
                    </p>
                  </div>
                </div>

                {server.description && (
                  <p className="text-gray-700 mb-4">{server.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{server.memberCount} members</span>
                  </div>
                  <div className="flex items-center">
                    {server.isPublic ? (
                      <>
                        <Globe size={16} className="mr-1" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="mr-1" />
                        <span>Private</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                loading={loading}
              >
                Join Server
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default JoinServerModal