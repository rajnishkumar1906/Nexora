import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen text-dark-500 overflow-hidden font-sans text-sharp">
      {/* Sidebar - Servers List */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 glass relative">
        {/* The actual page content will be rendered here */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
