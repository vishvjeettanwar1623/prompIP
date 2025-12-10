import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import axios from 'axios';
import UsernameModal from './UsernameModal';

const Navbar: React.FC = () => {
  const { isConnected, address } = useAccount();
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isConnected || !address) {
        setUsername(null);
        return;
      }

      setLoading(true);
      try {
        // Use the full API base URL
        const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await axios.get(`${apiBaseUrl}/auth/user-info`, {
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
      <nav className="sticky top-0 z-50 glass border-b border-dark-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur group-hover:blur-md transition-all"></div>
                <img 
                  src="/prompip.png" 
                  alt="PrompIP Logo" 
                  className="relative w-10 h-10 rounded-lg object-contain"
                />
              </div>
              <span className="text-xl font-display font-bold">
                <span className="text-gradient">Promp</span>
                <span className="text-dark-100">IP</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { to: '/marketplace', label: 'Explore', icon: '🔍' },
                { to: '/leaderboards', label: 'Leaderboards', icon: '🏆' },
                ...(isConnected ? [
                  { to: '/create', label: 'Create', icon: '✨' },
                  { to: '/dashboard', label: 'Dashboard', icon: '📊' }
                ] : [])
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/50'
                  }`}
                >
                  <span className="mr-1.5">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Username Badge */}
              {isConnected && username && !loading && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-dark-200 text-sm font-medium">{username}</span>
                </div>
              )}

              {/* Connect Button */}
              <div className="connect-button-wrapper">
                <ConnectButton />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-dark-800/50 text-dark-300 hover:text-dark-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-dark-700/50 animate-slide-down">
              <div className="flex flex-col space-y-2">
                {[
                  { to: '/marketplace', label: 'Explore', icon: '🔍' },
                  { to: '/leaderboards', label: 'Leaderboards', icon: '🏆' },
                  ...(isConnected ? [
                    { to: '/create', label: 'Create', icon: '✨' },
                    { to: '/dashboard', label: 'Dashboard', icon: '📊' }
                  ] : [])
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      location.pathname === link.to
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/50'
                    }`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
                
                {isConnected && username && (
                  <div className="px-4 py-3 bg-dark-800/30 border border-dark-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                      <span className="text-dark-200 text-sm font-medium">{username}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
