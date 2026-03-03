import React from 'react'

const Spinner = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default Spinner