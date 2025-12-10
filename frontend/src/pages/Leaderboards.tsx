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
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-glow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-dark-50">Leaderboards</h1>
              <p className="text-dark-400 mt-1">Top performers in the PrompIP community</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card p-2 mb-6 animate-slide-up">
          <nav className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveTab('creators')}
              className={`flex-1 py-3 px-5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'creators'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Top Creators
              </span>
            </button>
            <button
              onClick={() => setActiveTab('useful')}
              className={`flex-1 py-3 px-5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'useful'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                </svg>
                Most Useful
              </span>
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              className={`flex-1 py-3 px-5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'verified'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Most Verified
              </span>
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="card p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-2xl mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-dark-400">Loading leaderboards...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top Creators */}
            {activeTab === 'creators' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-dark-700">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                          Creator
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                          Reputation
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                          Prompts
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                          Verifications
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                      {topCreators.map((creator, index) => (
                        <tr key={creator.id} className="hover:bg-dark-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {index === 0 && <span className="text-2xl">🥇</span>}
                              {index === 1 && <span className="text-2xl">🥈</span>}
                              {index === 2 && <span className="text-2xl">🥉</span>}
                              <span className="text-sm font-semibold text-dark-200">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-dark-100">
                                  {creator.nickname || formatAddress(creator.walletAddress)}
                                </div>
                                {creator.nickname && (
                                  <div className="text-xs text-dark-500 font-mono">{formatAddress(creator.walletAddress)}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary-500/20 border border-primary-500/30 text-primary-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                              </svg>
                              {creator.reputationPoints}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300 font-medium">
                            {creator._count.prompts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300 font-medium">
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
                  <div key={prompt.id} className="card p-6 hover:shadow-card transition-all group">
                    <div className="flex items-start gap-6">
                      <div className="flex items-center gap-4">
                        {index < 3 ? (
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-glow flex-shrink-0">
                            <span className="text-3xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                            </span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-dark-400 font-bold text-xl">#{index + 1}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-dark-50 group-hover:text-gradient transition-all mb-2">{prompt.title}</h3>
                        <p className="text-dark-400 mb-3 line-clamp-2">{prompt.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-lg font-semibold">
                            {prompt.category}
                          </span>
                          <span className="text-dark-500 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {prompt.creator.nickname || formatAddress(prompt.creator.walletAddress)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="inline-flex flex-col items-end gap-2">
                          <div className="text-4xl font-bold text-gradient">{prompt.trustScore.toFixed(1)}%</div>
                          <div className="text-sm text-dark-400 font-semibold">Trust Score</div>
                          <div className="px-3 py-1 bg-dark-700 rounded-lg">
                            <span className="text-xs text-dark-400">{prompt.verificationCount} verifications</span>
                          </div>
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
                  <div key={prompt.id} className="card p-6 hover:shadow-card transition-all group">
                    <div className="flex items-start gap-6">
                      <div className="flex items-center gap-4">
                        {index < 3 ? (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-3xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                            </span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-dark-400 font-bold text-xl">#{index + 1}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-dark-50 group-hover:text-gradient transition-all mb-2">{prompt.title}</h3>
                        <p className="text-dark-400 mb-3 line-clamp-2">{prompt.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-lg font-semibold">
                            {prompt.category}
                          </span>
                          <span className="text-dark-500 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {prompt.creator.nickname || formatAddress(prompt.creator.walletAddress)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="inline-flex flex-col items-end gap-2">
                          <div className="text-4xl font-bold text-purple-400">{prompt.verificationCount}</div>
                          <div className="text-sm text-dark-400 font-semibold">Verifications</div>
                          <div className="space-y-1">
                            <div className="px-3 py-1 bg-dark-700 rounded-lg">
                              <span className="text-xs text-dark-400">Trust: {prompt.trustScore.toFixed(1)}%</span>
                            </div>
                            <div className="px-3 py-1 bg-dark-700 rounded-lg">
                              <span className="text-xs text-dark-400">Effectiveness: {prompt.effectivenessScore.toFixed(1)}%</span>
                            </div>
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
              <div className="card p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-dark-700 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-dark-400">No creators yet. Be the first to create and verify prompts!</p>
              </div>
            )}
            {activeTab === 'useful' && mostUseful.length === 0 && (
              <div className="card p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-dark-700 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                  </svg>
                </div>
                <p className="text-dark-400">No prompts with sufficient verifications yet.</p>
              </div>
            )}
            {activeTab === 'verified' && mostVerified.length === 0 && (
              <div className="card p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-dark-700 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-dark-400">No verified prompts yet. Start verifying!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;
