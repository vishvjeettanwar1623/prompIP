import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="PrompIP Logo" className="h-24 w-24" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Welcome to <span className="text-accent">PrompIP</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            The first AI Prompt Ownership & Reputation Platform powered by{' '}
            <span className="font-semibold text-accent">Story Protocol</span>
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Create, register, and share AI prompts as blockchain-verified intellectual property.
            Build reputation through community verification and feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/marketplace"
              className="bg-accent hover:bg-accent/90 text-black px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all"
            >
              Explore Prompts
            </Link>
            <Link
              to="/signup"
              className="bg-card hover:bg-card/80 text-white border border-border px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          How PrompIP Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-card border border-border rounded-xl p-8 hover:border-accent/50 transition-all">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Create Prompts</h3>
            <p className="text-gray-400">
              Craft high-quality AI prompts for coding, marketing, writing, and more. Share with
              the community and build your reputation.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card border border-border rounded-xl p-8 hover:border-accent/50 transition-all">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Register On-Chain</h3>
            <p className="text-gray-400">
              Register your prompts as IP assets on Story Protocol's Aeneid testnet. Create
              verifiable licenses with royalty terms.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card border border-border rounded-xl p-8 hover:border-accent/50 transition-all">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Earn Reputation</h3>
            <p className="text-gray-400">
              Get verified by the community. Useful prompts earn reputation points. Climb the
              leaderboards and become a top creator.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-accent/20 to-emerald-900/30 border border-accent/30 rounded-2xl p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Built on Story Protocol</h2>
            <p className="text-lg mb-6 text-gray-300">
              PrompIP leverages Story Protocol's TypeScript SDK to bring intellectual property
              rights to AI prompts. Every prompt is an on-chain IP asset with programmable
              licenses, royalties, and ownership verification.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-accent/20 text-accent px-4 py-2 rounded-full border border-accent/30">IP Asset Registration</span>
              <span className="bg-accent/20 text-accent px-4 py-2 rounded-full border border-accent/30">License Management</span>
              <span className="bg-accent/20 text-accent px-4 py-2 rounded-full border border-accent/30">On-Chain Ownership</span>
              <span className="bg-accent/20 text-accent px-4 py-2 rounded-full border border-accent/30">Aeneid Testnet</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Join the future of AI prompt ownership and licensing.
          </p>
          <Link
            to="/create"
            className="inline-block bg-accent hover:bg-accent/90 text-black px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all"
          >
            Create Your First Prompt
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
