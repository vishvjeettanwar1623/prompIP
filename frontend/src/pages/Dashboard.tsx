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
        axios.get(`${apiBaseUrl}/auth/user-info`, {
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
        `${apiBaseUrl}/auth/set-username`,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-2xl mb-4 animate-pulse">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <p className="text-dark-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-display font-bold text-dark-50 mb-2">My Dashboard</h1>
            <p className="text-dark-400">Manage your AI prompts and track your reputation</p>
          </div>
          <Link
            to="/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Prompt
          </Link>
        </div>

        {/* User Stats Cards */}
        {userInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-dark-400 text-sm mb-1">Reputation Points</p>
                  <p className="text-2xl font-bold text-gradient">{userInfo.reputationPoints}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-dark-400 text-sm mb-1">Total Prompts</p>
                  <p className="text-2xl font-bold text-dark-50">{myPrompts.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-dark-400 text-sm mb-1">On-Chain</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {myPrompts.filter(p => p.storyIpId).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        {userInfo && (
          <div className="card p-6 md:p-8 mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-dark-50">Profile Information</h2>
            </div>
            
            <div className="glass border border-primary-500/20 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-dark-400 mb-1">Wallet Address</p>
                  <p className="text-dark-100 font-mono text-sm">
                    {userInfo.walletAddress.slice(0, 10)}...{userInfo.walletAddress.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Username Section */}
            <div>
              {userInfo.nickname ? (
                <div className="glass border border-green-500/30 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-dark-400 mb-1">Username</p>
                      <p className="text-dark-100 font-semibold text-lg">{userInfo.nickname}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-dark-500 mt-3 ml-13">
                    🔒 Username is permanent and cannot be changed
                  </p>
                </div>
              ) : (
                <div>
                  {!showUsernameInput ? (
                    <div className="glass border border-yellow-500/30 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-yellow-400 font-semibold mb-1">No Username Set</p>
                            <p className="text-sm text-dark-400">Set your username to appear on leaderboards and build reputation</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowUsernameInput(true)}
                          className="btn-primary whitespace-nowrap"
                        >
                          Set Username
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSetUsername} className="glass border border-primary-500/30 rounded-xl p-6">
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-dark-200 mb-2">
                          Choose Your Username
                        </label>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="input"
                          placeholder="Enter username"
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
                      {usernameError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                          <p className="text-red-400 text-sm">{usernameError}</p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={settingUsername}
                          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingUsername ? 'Setting...' : 'Confirm Username'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUsernameInput(false);
                            setNewUsername('');
                            setUsernameError('');
                          }}
                          className="btn-secondary px-8"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-primary-400 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Prompts List */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-dark-50">My Prompts</h2>
          </div>
          {myPrompts.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-dark-700 rounded-2xl mb-6">
                <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-dark-400 mb-2 text-lg">No prompts yet</p>
              <p className="text-dark-500 text-sm mb-6">Create your first AI prompt and start building your reputation</p>
              <Link
                to="/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Prompt
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myPrompts.map((prompt) => (
                <div key={prompt.id} className="card p-6 hover:shadow-card transition-all group">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-dark-50 group-hover:text-gradient transition-all">{prompt.title}</h3>
                        <span className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-semibold rounded-lg">
                          {prompt.category}
                        </span>
                        {prompt.storyIpId && (
                          <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            On-Chain
                          </span>
                        )}
                      </div>
                      <p className="text-dark-400 text-sm mb-4 line-clamp-2">{prompt.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-dark-400">Trust:</span>
                          <span className={`font-semibold ${prompt.trustScore >= 70 ? 'text-primary-400' : prompt.trustScore >= 40 ? 'text-yellow-400' : 'text-dark-500'}`}>
                            {prompt.trustScore.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-dark-400">Verifications:</span>
                          <span className="font-semibold text-dark-200">{prompt.verificationCount}</span>
                        </div>
                      </div>

                      {prompt.storyIpId && (
                        <div className="mt-4 pt-4 border-t border-dark-700 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider whitespace-nowrap">IP ID:</span>
                            <span className="font-mono text-xs text-dark-400 break-all">
                              {prompt.storyIpId.slice(0, 30)}...
                            </span>
                          </div>
                          {prompt.storyLicenseTermsId && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider whitespace-nowrap">License:</span>
                              <span className="font-mono text-xs text-dark-400">
                                {prompt.storyLicenseTermsId}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link
                        to={`/prompt/${prompt.id}`}
                        className="btn-secondary text-sm px-4 py-2 text-center whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      {prompt.storyIpId && (
                        <a
                          href={`https://aeneid.storyscan.io/address/${prompt.storyIpId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-lg text-sm font-medium text-center transition-all inline-flex items-center justify-center gap-2"
                        >
                          Explorer
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      {!prompt.storyIpId && (
                        <>
                          <button
                            onClick={() => handleRegisterOnChain(prompt.id)}
                            disabled={registeringId === prompt.id}
                            className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {registeringId === prompt.id ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering
                              </span>
                            ) : 'Register On-Chain'}
                          </button>
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            disabled={deletingId === prompt.id}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
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
