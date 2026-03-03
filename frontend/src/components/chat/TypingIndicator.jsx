import { useEffect, useState } from 'react'

const TypingIndicator = ({ users = [] }) => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 400)

    return () => clearInterval(interval)
  }, [])

  if (users.length === 0) return null

  let text = ''
  if (users.length === 1) {
    text = `${users[0]} is typing`
  } else if (users.length === 2) {
    text = `${users[0]} and ${users[1]} are typing`
  } else {
    text = `${users.length} people are typing`
  }

  return (
    <div className="flex items-center px-4 py-2 text-sm text-gray-500">
      <div className="flex space-x-1 mr-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}{dots}</span>
    </div>
  )
}

export default TypingIndicator