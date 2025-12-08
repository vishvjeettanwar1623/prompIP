import React, { useState, useEffect } from 'react';
import { promptAPI } from '../services/api';

interface Creator {
  id: string;
  walletAddress: string;
  nickname?: string;
  reputationPoints: number;
  _count: {
    prompts: number;
    verifications: number;
  };
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  trustScore: number;
  effectivenessScore: number;
  verificationCount: number;
  creator: {
    id: string;
    walletAddress: string;
    nickname?: string;
    reputationPoints: number;
  };
}

const Leaderboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'creators' | 'useful' | 'verified'>('creators');
  const [topCreators, setTopCreators] = useState<Creator[]>([]);
  const [mostUseful, setMostUseful] = useState<Prompt[]>([]);
  const [mostVerified, setMostVerified] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const [creatorsRes, usefulRes, verifiedRes] = await Promise.all([
        promptAPI.getTopCreators(20),
        promptAPI.getMostUseful(20, 3),
        promptAPI.getMostVerified(20),
      ]);

      setTopCreators(creatorsRes.data);
      setMostUseful(usefulRes.data);
      setMostVerified(verifiedRes.data);
    } catch (error) {
      console.error('Failed to fetch leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Leaderboards</h1>
          <p className="text-gray-400">Top performers in the PrompIP community</p>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg mb-6">
          <div className="border-b border-border">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('creators')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'creators'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                👑 Top Creators
              </button>
              <button
                onClick={() => setActiveTab('useful')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'useful'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                ⭐ Most Useful Prompts
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'verified'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                🔥 Most Verified Prompts
              </button>
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {/* Top Creators */}
            {activeTab === 'creators' && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-darker">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Creator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Reputation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Prompts
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Verifications
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {topCreators.map((creator, index) => (
                        <tr key={creator.id} className="hover:bg-darker transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                              {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                              {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                              <span className="text-sm font-medium text-white">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {creator.nickname || formatAddress(creator.walletAddress)}
                            </div>
                            {creator.nickname && (
                              <div className="text-xs text-gray-500">{formatAddress(creator.walletAddress)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent">
                              ⭐ {creator.reputationPoints}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {creator._count.prompts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {creator._count.verifications}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Most Useful Prompts */}
            {activeTab === 'useful' && (
              <div className="space-y-4">
                {mostUseful.map((prompt, index) => (
                  <div key={prompt.id} className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {index === 0 && <span className="text-3xl">🥇</span>}
                          {index === 1 && <span className="text-3xl">🥈</span>}
                          {index === 2 && <span className="text-3xl">🥉</span>}
                          {index > 2 && <span className="text-gray-500 font-bold text-lg">#{index + 1}</span>}
                          <h3 className="text-xl font-semibold text-white">{prompt.title}</h3>
                        </div>
                        <p className="text-gray-400 mb-3">{prompt.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="bg-accent/20 text-accent px-3 py-1 rounded-full">
                            {prompt.category}
                          </span>
                          <span className="text-gray-500">
                            by {prompt.creator.nickname || formatAddress(prompt.creator.walletAddress)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-3xl font-bold text-accent">{prompt.trustScore.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">Trust Score</div>
                        <div className="mt-2 text-sm text-gray-400">
                          {prompt.verificationCount} verifications
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Most Verified Prompts */}
            {activeTab === 'verified' && (
              <div className="space-y-4">
                {mostVerified.map((prompt, index) => (
                  <div key={prompt.id} className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {index === 0 && <span className="text-3xl">🥇</span>}
                          {index === 1 && <span className="text-3xl">🥈</span>}
                          {index === 2 && <span className="text-3xl">🥉</span>}
                          {index > 2 && <span className="text-gray-500 font-bold text-lg">#{index + 1}</span>}
                          <h3 className="text-xl font-semibold text-white">{prompt.title}</h3>
                        </div>
                        <p className="text-gray-400 mb-3">{prompt.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="bg-accent/20 text-accent px-3 py-1 rounded-full">
                            {prompt.category}
                          </span>
                          <span className="text-gray-500">
                            by {prompt.creator.nickname || formatAddress(prompt.creator.walletAddress)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-3xl font-bold text-accent">{prompt.verificationCount}</div>
                        <div className="text-sm text-gray-500">Verifications</div>
                        <div className="mt-2 space-y-1">
                          <div className="text-sm text-gray-400">
                            Trust: {prompt.trustScore.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-400">
                            Effectiveness: {prompt.effectivenessScore.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty States */}
            {activeTab === 'creators' && topCreators.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-gray-500">No creators yet. Be the first to create and verify prompts!</p>
              </div>
            )}
            {activeTab === 'useful' && mostUseful.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-gray-500">No prompts with sufficient verifications yet.</p>
              </div>
            )}
            {activeTab === 'verified' && mostVerified.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-gray-500">No verified prompts yet. Start verifying!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;
