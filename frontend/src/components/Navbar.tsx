import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import axios from 'axios';
import UsernameModal from './UsernameModal';

const Navbar: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isConnected || !address) {
        setUsername(null);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get('/api/auth/user-info', {
          headers: { 'x-wallet-address': address },
        });
        
        const nickname = response.data.nickname;
        setUsername(nickname);
        
        // Show modal if no username is set
        if (!nickname) {
          setShowUsernameModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [isConnected, address]);

  return (
    <>
      <nav className="bg-dark-900 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="PrompIP Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-white"><span className="text-accent">Promp</span>IP</span>
              </Link>
              <div className="ml-10 flex items-baseline space-x-2">
                <Link
                  to="/marketplace"
                  className="text-gray-400 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Explore
                </Link>
                <Link
                  to="/leaderboards"
                  className="text-gray-400 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Leaderboards
                </Link>
                {isConnected && (
                  <>
                    <Link
                      to="/create"
                      className="text-gray-400 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Create
                    </Link>
                    <Link
                      to="/dashboard"
                      className="text-gray-400 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && username && !loading && (
                <div className="flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-lg">
                  <span className="text-accent text-sm">👤</span>
                  <span className="text-white text-sm font-medium">{username}</span>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        walletAddress={address || ''}
      />
    </>
  );
};

export default Navbar;
