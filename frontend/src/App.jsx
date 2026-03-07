import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { NexoraProvider, useNexora } from "./context/NexoraContext";
import { SocketProvider } from "./context/SocketContext";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Server from "./pages/Server";
import Channel from "./pages/Channel";
import DMChat from "./pages/DMChat";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Invite from "./pages/Invite";
import Explore from "./pages/Explore";

function AppContent() {
  const { isAuthenticated, loading } = useNexora();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-600">
            NX
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <SocketProvider>
        <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
          />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/chat/:friendId" element={<DMChat />} />
            <Route path="/server/:serverId" element={<Server />}>
              <Route path="channel/:channelId" element={<Channel />} />
            </Route>
            <Route path="/game/:sessionId" element={<Game />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/invite/:inviteCode" element={<Invite />} />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

function App() {
  return (
    <NexoraProvider>
      <AppContent />
    </NexoraProvider>
  );
}

export default App;  
