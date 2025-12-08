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
      localStorage.setItem('walletAddress', address);
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
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <p className="text-gray-400">Loading parent prompt...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {remixId ? '🔄 Create Remix' : 'Create New Prompt'}
          </h1>
          
          {parentPrompt && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-accent">
                Remixing: <span className="font-semibold">{parentPrompt.title}</span>
              </p>
              <p className="text-xs text-accent/70 mt-1">
                Your remix will be linked to the original on Story Protocol
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-darker border border-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="E.g., Advanced Code Review Prompt"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-darker border border-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Brief description of what this prompt does..."
              />
            </div>

            <div>
              <label htmlFor="promptText" className="block text-sm font-medium text-gray-300">
                Prompt Text
              </label>
              <textarea
                id="promptText"
                name="promptText"
                required
                rows={8}
                value={formData.promptText}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-darker border border-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent font-mono text-sm"
                placeholder="Enter the full prompt text here..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be locked until a user purchases a license
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-darker border border-border rounded-md text-white focus:outline-none focus:ring-accent focus:border-accent"
                >
                  <option value="coding">Coding</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="licenseType" className="block text-sm font-medium text-gray-300">
                  License Type
                </label>
                <select
                  id="licenseType"
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-darker border border-border rounded-md text-white focus:outline-none focus:ring-accent focus:border-accent"
                >
                  <option value="ONE_TIME">One-Time Use</option>
                  <option value="RESALE_ALLOWED">Resale Allowed</option>
                </select>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <strong className="text-accent">Note:</strong> After creating your prompt, register it on-chain
                using Story Protocol to enable provable ownership and verification.
                Build your reputation by receiving useful verifications from the community!
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent hover:bg-accent/90 text-black px-6 py-3 rounded-md font-medium disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating...' : 'Create Prompt'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="px-6 py-3 border border-border rounded-md text-gray-300 hover:bg-card transition-all"
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
