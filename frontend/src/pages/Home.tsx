import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
              <img 
                src="/prompip.png" 
                alt="PrompIP Logo" 
                className="relative h-20 w-20 rounded-2xl object-contain shadow-glow"
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight">
            Own Your <span className="text-gradient">AI Prompts</span>
            <br />
            Build Your <span className="text-gradient">Reputation</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-dark-300 mb-6 max-w-3xl mx-auto font-medium">
            The first AI Prompt Ownership & Reputation Platform powered by{' '}
            <span className="text-primary-400 font-semibold">Story Protocol</span>
          </p>

          <p className="text-lg text-dark-400 mb-12 max-w-2xl mx-auto">
            Create, register, and share AI prompts as blockchain-verified intellectual property.
            Build reputation through community verification and earn recognition.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/marketplace"
              className="btn-primary group"
            >
              <span>Explore Marketplace</span>
              <svg className="inline-block w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/create"
              className="btn-secondary group"
            >
              <span>Create Prompt</span>
              <svg className="inline-block w-5 h-5 ml-2 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How <span className="text-gradient">PrompIP</span> Works
          </h2>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            A seamless workflow to protect, share, and monetize your AI creativity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
              title: 'Create & Craft',
              description: 'Design high-quality AI prompts for any use case. From coding assistants to creative writing tools.',
              gradient: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: 'Register & Protect',
              description: 'Register prompts as IP assets on Story Protocol. Immutable proof of ownership with smart contracts.',
              gradient: 'from-primary-500/20 to-emerald-500/20',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Build Reputation',
              description: 'Earn reputation through community verifications. Top creators get featured and recognized.',
              gradient: 'from-purple-500/20 to-pink-500/20',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="card card-hover group animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`h-full p-8 bg-gradient-to-br ${feature.gradient} rounded-xl`}>
                <div className="mb-6 inline-flex p-4 bg-dark-800/50 rounded-xl text-primary-400 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-dark-50">
                  {feature.title}
                </h3>
                <p className="text-dark-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass rounded-3xl p-12 md:p-16 shadow-card animate-fade-in">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-6">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Powered by <span className="text-gradient">Story Protocol</span>
            </h2>

            <p className="text-lg md:text-xl text-dark-300 mb-8 leading-relaxed">
              PrompIP leverages Story Protocol's infrastructure to bring true intellectual property
              rights to AI prompts. Every prompt becomes an on-chain IP asset with programmable
              licenses, automated royalties, and verifiable ownership.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🔗', label: 'IP Registration' },
                { icon: '📜', label: 'Smart Licensing' },
                { icon: '✓', label: 'Ownership Proof' },
                { icon: '⚡', label: 'Aeneid Network' },
              ].map((item, i) => (
                <div key={i} className="badge-primary p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-semibold">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-800/80 to-primary-700/80 p-12 md:p-16 text-center shadow-card animate-fade-in">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTIgMTJjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTEyIDEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTIgMTJjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of creators protecting their AI prompts and building reputation on-chain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Create Your First Prompt
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
