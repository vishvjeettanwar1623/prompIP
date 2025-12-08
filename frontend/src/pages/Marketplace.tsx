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
    <div className="min-h-screen bg-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Explore Prompts</h1>
          <p className="mt-2 text-lg text-gray-400">
            Discover community-verified AI prompts with blockchain-proven ownership
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-accent text-black'
                  : 'bg-card text-gray-300 border border-border hover:border-accent/50'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Prompts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No prompts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                    {prompt.category}
                  </span>
                  {prompt.storyIpId && (
                    <span className="text-xs text-accent font-medium">✓ On-Chain</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{prompt.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{prompt.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${prompt.trustScore >= 70 ? 'text-accent' : prompt.trustScore >= 40 ? 'text-yellow-500' : 'text-gray-500'}`}>
                      {prompt.trustScore.toFixed(0)}% trusted
                    </span>
                    <span className="text-sm text-gray-500">({prompt.verificationCount} reviews)</span>
                  </div>
                  <Link
                    to={`/prompt/${prompt.id}`}
                    className="bg-accent hover:bg-accent/90 text-black px-4 py-2 rounded-md text-sm font-medium transition-all"
                  >
                    View Details
                  </Link>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  by {prompt.creator.nickname || prompt.creator.walletAddress.slice(0, 8) + '...'}
                  {prompt.creator.reputationPoints > 0 && (
                    <span className="ml-2 text-yellow-500">⭐ {prompt.creator.reputationPoints} rep</span>
                  )}
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
