import React from 'react'
import { Outlet } from 'react-router-dom'
import SideNav from './SideNav'
import { useAuth } from '../../context/AuthContext'

const MainLayout = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className="flex">
      <SideNav />
      {/* Add ml-64 to push content right of the fixed sidebar */}
      <main className="flex-1 ml-64 min-h-screen bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout