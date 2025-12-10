import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { promptAPI } from '../services/api';
import axios from 'axios';

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  storyIpId?: string;
  storyLicenseTermsId?: string;
  isListed: boolean;
  createdAt: string;
  trustScore: number;
  effectivenessScore: number;
  verificationCount: number;
}

interface UserInfo {
  id: string;
  email: string;
  walletAddress: string;
  nickname: string | null;
  reputationPoints: number;
}

const Dashboard: React.FC = () => {
  const { address } = useAccount();
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [settingUsername, setSettingUsername] = useState(false);

  // Store wallet address in localStorage for API interceptor
  useEffect(() => {
    if (address) {
      try {
        localStorage.setItem('walletAddress', address);
      } catch (error) {
        console.warn('Unable to store wallet address in localStorage');
      }
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use the full API base URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
      const [promptsRes, userRes] = await Promise.all([
        promptAPI.getUserPrompts(),
        axios.get(`${apiBaseUrl}/api/auth/user-info`, {
          headers: { 'x-wallet-address': address },
        }),
      ]);
      setMyPrompts(promptsRes.data);
      setUserInfo(userRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setSettingUsername(true);

    try {
      // Use the full API base URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
      await axios.post(
        `${apiBaseUrl}/api/auth/set-username`,
        { nickname: newUsername },
        {
          headers: {
            'x-wallet-address': address,
          },
        }
      );
      setSuccess('Username set successfully!');
      setShowUsernameInput(false);
      setNewUsername('');
      // Refresh user info
      fetchData();
    } catch (err: any) {
      setUsernameError(err.response?.data?.error || 'Failed to set username');
    } finally {
      setSettingUsername(false);
    }
  };

  const handleRegisterOnChain = async (promptId: string) => {
    setRegisteringId(promptId);
    setError('');
    setSuccess('');

    try {
      const response = await promptAPI.registerOnChain(promptId);
      setSuccess(
        `Successfully registered on Story Protocol! IP Tx: ${response.data.ipTxHash.slice(0, 10)}...`
      );
      // Refresh data
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register on-chain');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    setDeletingId(id);
    setError('');
    setSuccess('');

    try {
      await promptAPI.deletePrompt(id);
      setSuccess('Prompt deleted successfully');
      // Refresh data
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete prompt');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <Link
            to="/create"
            className="bg-accent hover:bg-accent/90 text-black px-4 py-2 rounded-md text-sm font-medium transition-all"
          >
            Create New Prompt
          </Link>
        </div>

        {/* User Profile Section */}
        {userInfo && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                <p className="text-white font-mono text-sm">
                  {userInfo.walletAddress.slice(0, 6)}...{userInfo.walletAddress.slice(-4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Reputation Points</p>
                <p className="text-accent font-bold text-lg">{userInfo.reputationPoints}</p>
              </div>
            </div>

            {/* Username Section */}
            <div className="mt-6 pt-6 border-t border-border">
              {userInfo.nickname ? (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Username</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-lg">{userInfo.nickname}</span>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">✓ Set</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Username is permanent and cannot be changed</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-yellow-400 mb-1">⚠️ No Username Set</p>
                      <p className="text-xs text-gray-400">Set your username to appear on leaderboards</p>
                    </div>
                    {!showUsernameInput && (
                      <button
                        onClick={() => setShowUsernameInput(true)}
                        className="bg-accent hover:bg-accent/90 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Set Username
                      </button>
                    )}
                  </div>

                  {showUsernameInput && (
                    <form onSubmit={handleSetUsername} className="mt-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full px-4 py-2 bg-dark border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Enter username"
                            required
                            minLength={3}
                            maxLength={20}
                            pattern="[a-zA-Z0-9]+"
                            title="Username can only contain letters and numbers"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            3-20 characters. Letters and numbers only. <strong>Cannot be changed later!</strong>
                          </p>
                        </div>
                        <button
                          type="submit"
                          disabled={settingUsername}
                          className="bg-accent hover:bg-accent/90 text-black px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingUsername ? 'Setting...' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUsernameInput(false);
                            setNewUsername('');
                            setUsernameError('');
                          }}
                          className="bg-dark-900 hover:bg-dark-800 text-gray-300 px-6 py-2 rounded-lg border border-border transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      {usernameError && (
                        <p className="text-red-400 text-sm mt-2">{usernameError}</p>
                      )}
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-accent/10 border border-accent/30 text-accent px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Prompts List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Prompts</h2>
          {myPrompts.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">You haven't created any prompts yet.</p>
              <Link
                to="/create"
                className="inline-block bg-accent hover:bg-accent/90 text-black px-6 py-3 rounded-md font-medium transition-all"
              >
                Create Your First Prompt
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myPrompts.map((prompt) => (
                <div key={prompt.id} className="bg-card border border-border rounded-lg p-6 hover:border-accent/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{prompt.title}</h3>
                        <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                          {prompt.category}
                        </span>
                        {prompt.storyIpId && (
                          <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                            ✓ On-Chain
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{prompt.description}</p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          <span className="font-medium text-gray-400">Trust Score:</span>{' '}
                          <span className={prompt.trustScore >= 70 ? 'text-accent' : prompt.trustScore >= 40 ? 'text-yellow-500' : 'text-gray-500'}>
                            {prompt.trustScore.toFixed(1)}%
                          </span>
                        </p>
                        <p>
                          <span className="font-medium text-gray-400">Verifications:</span> {prompt.verificationCount}
                        </p>
                        {prompt.storyIpId && (
                          <>
                            <p>
                              <span className="font-medium text-gray-400">Story IP ID:</span>{' '}
                              <span className="font-mono text-xs text-gray-500">
                                {prompt.storyIpId.slice(0, 20)}...
                              </span>
                            </p>
                            {prompt.storyLicenseTermsId && (
                              <p>
                                <span className="font-medium text-gray-400">License Terms ID:</span>{' '}
                                <span className="font-mono text-xs text-gray-500">
                                  {prompt.storyLicenseTermsId}
                                </span>
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Link
                        to={`/prompt/${prompt.id}`}
                        className="px-4 py-2 border border-border rounded-md text-sm font-medium text-gray-300 hover:bg-darker text-center transition-all"
                      >
                        View
                      </Link>
                      {prompt.storyIpId && (
                        <a
                          href={`https://aeneid.storyscan.io/address/${prompt.storyIpId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 bg-accent/10 border border-accent/30 rounded-md text-sm text-accent hover:bg-accent/20 text-center transition-all"
                        >
                          View on Explorer →
                        </a>
                      )}
                      {!prompt.storyIpId && (
                        <>
                          <button
                            onClick={() => handleRegisterOnChain(prompt.id)}
                            disabled={registeringId === prompt.id}
                            className="px-4 py-2 bg-accent hover:bg-accent/90 text-black rounded-md text-sm font-medium disabled:opacity-50 transition-all"
                          >
                            {registeringId === prompt.id ? 'Registering...' : 'Register On-Chain'}
                          </button>
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            disabled={deletingId === prompt.id}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-md text-sm font-medium disabled:opacity-50 transition-all"
                          >
                            {deletingId === prompt.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
