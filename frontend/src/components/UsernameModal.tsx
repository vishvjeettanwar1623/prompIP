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
        `${apiBaseUrl}/auth/set-username`,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card max-w-md w-full p-8 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-glow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-dark-50">Welcome to PrompIP!</h2>
          </div>
        </div>
        <p className="text-dark-400 mb-6 leading-relaxed">
          Choose a unique username to be displayed on leaderboards and in the marketplace.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-semibold text-dark-200 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Enter your username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              title="Username can only contain letters and numbers"
            />
            <p className="text-xs text-dark-500 mt-2 flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>3-20 characters. Letters and numbers only. <strong className="text-yellow-400">Cannot be changed later!</strong></span>
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting...
                </span>
              ) : (
                'Set Username'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-8"
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
