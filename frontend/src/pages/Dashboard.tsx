import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { promptAPI } from '../services/api';

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

const Dashboard: React.FC = () => {
  const { address } = useAccount();
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Store wallet address in localStorage for API interceptor
  useEffect(() => {
    if (address) {
      localStorage.setItem('walletAddress', address);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const promptsRes = await promptAPI.getUserPrompts();
      setMyPrompts(promptsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-white">My Prompts</h1>
          <Link
            to="/create"
            className="bg-accent hover:bg-accent/90 text-black px-4 py-2 rounded-md text-sm font-medium transition-all"
          >
            Create New Prompt
          </Link>
        </div>

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
                          href={`https://testnet.storyscan.xyz/ipa/${prompt.storyIpId}`}
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
