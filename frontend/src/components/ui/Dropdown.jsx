import { useState, useRef, useEffect } from 'react'

const Dropdown = ({
  trigger,
  children,
  position = 'bottom-right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const positions = {
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 min-w-[200px] bg-white rounded-lg shadow-lg
            border border-gray-200 py-1
            ${positions[position]}
            ${className}
          `}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export const DropdownItem = ({ children, onClick, className = '', icon = null }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-4 py-2 text-left text-sm text-gray-700
        hover:bg-gray-100 transition-colors
        flex items-center
        ${className}
      `}
    >
      {icon && <span className="mr-2 w-4 h-4">{icon}</span>}
      {children}
    </button>
  )
}

export default Dropdown