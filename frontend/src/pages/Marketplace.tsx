import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptAPI } from '../services/api';

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  storyIpId?: string;
  trustScore: number;
  verificationCount: number;
  creator: {
    walletAddress: string;
    nickname?: string;
    reputationPoints: number;
  };
}

const Marketplace: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await promptAPI.getMarketplace();
      setPrompts(response.data);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(prompts.map((p) => p.category)))];
  const filteredPrompts = filter === 'all' ? prompts : prompts.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-50 mb-4">
            Explore <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            Discover community-verified AI prompts with blockchain-proven ownership
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                filter === cat
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow'
                  : 'bg-dark-800/50 text-dark-300 border border-dark-700 hover:border-primary-500/50 hover:text-dark-100'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Prompts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-20 bg-dark-700 rounded-full"></div>
                  <div className="h-4 w-16 bg-dark-700 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-dark-700 rounded mb-3"></div>
                <div className="h-4 w-full bg-dark-700 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-dark-700 rounded mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-dark-700 rounded"></div>
                  <div className="h-9 w-24 bg-dark-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-800/50 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-dark-400 text-lg">No prompts found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt, index) => (
              <div
                key={prompt.id}
                className="card card-hover group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="badge badge-primary capitalize">
                      {prompt.category}
                    </span>
                    {prompt.storyIpId && (
                      <div className="flex items-center gap-1 text-xs text-primary-400 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        On-Chain
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-display font-bold text-dark-50 mb-3 group-hover:text-primary-400 transition-colors">
                    {prompt.title}
                  </h3>
                  <p className="text-dark-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {prompt.description}
                  </p>

                  {/* Trust Score */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-700">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        prompt.trustScore >= 70 ? 'bg-primary-500' : 
                        prompt.trustScore >= 40 ? 'bg-yellow-500' : 'bg-dark-500'
                      }`}></div>
                      <span className={`text-sm font-bold ${
                        prompt.trustScore >= 70 ? 'text-primary-400' : 
                        prompt.trustScore >= 40 ? 'text-yellow-500' : 'text-dark-400'
                      }`}>
                        {prompt.trustScore.toFixed(0)}% Trust
                      </span>
                    </div>
                    <span className="text-xs text-dark-500">
                      {prompt.verificationCount} {prompt.verificationCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>

                  {/* Creator & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {(prompt.creator.nickname || prompt.creator.walletAddress)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-dark-300 font-medium">
                          {prompt.creator.nickname || prompt.creator.walletAddress.slice(0, 6) + '...'}
                        </p>
                        {prompt.creator.reputationPoints > 0 && (
                          <p className="text-xs text-primary-400">
                            ⭐ {prompt.creator.reputationPoints} rep
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/prompt/${prompt.id}`}
                      className="btn-ghost text-xs px-3 py-2"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
