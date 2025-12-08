import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import PromptDetail from './pages/PromptDetail';
import CreatePrompt from './pages/CreatePrompt';
import Dashboard from './pages/Dashboard';
import Leaderboards from './pages/Leaderboards';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useAccount();
  return isConnected ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/prompt/:id" element={<PromptDetail />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePrompt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboards" element={<Leaderboards />} />
      </Routes>
    </div>
  );
};

export default App;
