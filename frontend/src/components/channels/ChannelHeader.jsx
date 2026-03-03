import { useState } from 'react'
import { Hash, Users, Pin, Bell, Search } from 'lucide-react'
import { useServer } from '../../context/ServerContext'
import Button from '../ui/Button'

const ChannelHeader = () => {
  const { currentChannel } = useServer()
  const [showMemberList, setShowMemberList] = useState(false)

  if (!currentChannel) return null

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      {/* Left - Channel Info */}
      <div className="flex items-center">
        <Hash size={22} className="text-gray-500 mr-2" />
        <div>
          <h2 className="font-semibold text-gray-800">{currentChannel.name}</h2>
          {currentChannel.topic && (
            <p className="text-xs text-gray-500 truncate max-w-md">
              {currentChannel.topic}
            </p>
          )}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Bell size={18} />
        </Button>
        <Button variant="ghost" size="sm">
          <Pin size={18} />
        </Button>
        <Button variant="ghost" size="sm">
          <Search size={18} />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMemberList(!showMemberList)}
          className={showMemberList ? 'bg-gray-100' : ''}
        >
          <Users size={18} className="mr-2" />
          <span className="text-sm">Members</span>
        </Button>
      </div>
    </div>
  )
}

export default ChannelHeader