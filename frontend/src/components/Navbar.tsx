import React from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const Navbar: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <nav className="bg-dark-900 border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-accent text-2xl">◎</span>
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
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
