import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { promptAPI } from '../services/api';

interface ParentPrompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  category: string;
  storyIpId: string | null;
}

const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const remixId = searchParams.get('remix');
  const { address } = useAccount();
  
  const [parentPrompt, setParentPrompt] = useState<ParentPrompt | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promptText: '',
    category: 'coding',
    licenseType: 'ONE_TIME',
  });
  const [loading, setLoading] = useState(false);
  const [loadingParent, setLoadingParent] = useState(false);
  const [error, setError] = useState('');

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

  // Load parent prompt if this is a remix
  useEffect(() => {
    if (remixId) {
      setLoadingParent(true);
      promptAPI.getPromptById(remixId)
        .then((response) => {
          const parent = response.data;
          setParentPrompt(parent);
          // Pre-fill form with remix template
          setFormData({
            title: `Remix: ${parent.title}`,
            description: `A remix of "${parent.title}" - ${parent.description}`,
            promptText: parent.promptText || '',
            category: parent.category,
            licenseType: 'ONE_TIME',
          });
        })
        .catch(() => {
          setError('Failed to load parent prompt');
        })
        .finally(() => {
          setLoadingParent(false);
        });
    }
  }, [remixId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        parentPromptId: remixId || undefined,
      };
      const response = await promptAPI.createPrompt(payload);
      navigate(`/prompt/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create prompt');
    } finally {
      setLoading(false);
    }
  };

  if (loadingParent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-2xl mb-4 animate-pulse">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-dark-400">Loading parent prompt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 md:p-10 animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {remixId ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-dark-50">
                  {remixId ? 'Create Remix' : 'Create New Prompt'}
                </h1>
                <p className="text-dark-400 text-sm mt-1">
                  {remixId ? 'Build upon an existing prompt' : 'Share your AI prompt with the community'}
                </p>
              </div>
            </div>
          </div>
          
          {parentPrompt && (
            <div className="glass border border-primary-500/30 rounded-xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary-400 mb-1">
                    Remixing: {parentPrompt.title}
                  </p>
                  <p className="text-xs text-dark-400">
                    Your remix will be linked to the original on Story Protocol blockchain
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-dark-200 mb-2">
                Prompt Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="E.g., Advanced Code Review Prompt for React Apps"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-dark-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="input resize-none"
                placeholder="Describe what your prompt does and what makes it unique..."
              />
            </div>

            <div>
              <label htmlFor="promptText" className="block text-sm font-semibold text-dark-200 mb-2">
                Prompt Content
              </label>
              <textarea
                id="promptText"
                name="promptText"
                required
                rows={10}
                value={formData.promptText}
                onChange={handleChange}
                className="input resize-none font-mono text-sm"
                placeholder="Enter the full prompt text here...\n\nExample:\nYou are an expert code reviewer. Analyze the following code and provide detailed feedback on...."
              />
              <p className="mt-2 text-xs text-dark-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                This content will be locked until users verify or purchase a license
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-dark-200 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="coding">💻 Coding</option>
                  <option value="marketing">📈 Marketing</option>
                  <option value="writing">✍️ Writing</option>
                  <option value="design">🎨 Design</option>
                  <option value="business">💼 Business</option>
                  <option value="education">📚 Education</option>
                  <option value="other">🔧 Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="licenseType" className="block text-sm font-semibold text-dark-200 mb-2">
                  License Type
                </label>
                <select
                  id="licenseType"
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="ONE_TIME">One-Time Use</option>
                  <option value="RESALE_ALLOWED">Resale Allowed</option>
                </select>
              </div>
            </div>

            <div className="glass border border-primary-500/20 rounded-xl p-5">
              <div className="flex gap-3">
                <div className="w-5 h-5 text-primary-400 flex-shrink-0">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-dark-300 leading-relaxed">
                  <strong className="text-primary-400">Next Steps:</strong> After creating your prompt, you can register it on-chain
                  using Story Protocol for provable ownership. Build your reputation by receiving verifications from the community!
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
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
                    Creating...
                  </span>
                ) : (
                  'Create Prompt'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="btn-secondary px-8"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
