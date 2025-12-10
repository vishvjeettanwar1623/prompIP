import React, { useState } from 'react';
import axios from 'axios';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onClose, walletAddress }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the full API base URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
      await axios.post(
        `${apiBaseUrl}/api/auth/set-username`,
        { nickname: username },
        {
          headers: {
            'x-wallet-address': walletAddress,
          },
        }
      );
      onClose();
      window.location.reload(); // Refresh to update navbar
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome to PrompIP!</h2>
        <p className="text-gray-400 mb-6">
          Choose a unique username to be displayed on leaderboards and in the marketplace.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              title="Username can only contain letters and numbers"
            />
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters. Letters and numbers only.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-accent hover:bg-accent/90 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting...' : 'Set Username'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-dark-900 hover:bg-dark-800 text-gray-300 font-semibold py-3 rounded-lg border border-border transition-colors"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
