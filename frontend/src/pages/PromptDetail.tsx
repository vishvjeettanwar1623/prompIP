import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { promptAPI } from '../services/api';

interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText?: string;
  category: string;
  licenseType: string;
  storyIpId: string | null;
  storyLicenseTermsId: string | null;
  parentPromptId: string | null;
  trustScore: number;
  effectivenessScore: number;
  verificationCount: number;
  createdAt: string;
  creator: {
    id: string;
    email: string;
    walletAddress: string;
    nickname?: string;
    reputationPoints: number;
  };
  parentPrompt?: {
    id: string;
    title: string;
    storyIpId: string | null;
    creator: {
      nickname?: string;
      walletAddress: string;
    };
  };
  derivatives?: {
    id: string;
    title: string;
    storyIpId: string | null;
    trustScore: number;
  }[];
  _count?: {
    derivatives: number;
  };
}

interface Verification {
  id: string;
  isUseful: boolean;
  feedback: string | null;
  createdAt: string;
  user: {
    id: string;
    walletAddress: string;
    nickname?: string;
    reputationPoints: number;
  };
}

const PromptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPromptDetails();
    fetchVerifications();
  }, [id]);

  const fetchPromptDetails = async () => {
    try {
      const response = await promptAPI.getPromptById(id!);
      setPrompt(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    try {
      const response = await promptAPI.getVerifications(id!);
      setVerifications(response.data.verifications);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    }
  };

  const handleVerify = async (isUseful: boolean) => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!prompt) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await promptAPI.verifyPrompt(id!, {
        userId: address,
        isUseful,
        feedback: verificationFeedback || undefined,
      });

      // Show success message with license info
      if (response.data.license) {
        setSuccess(`✅ Verification submitted! 🎫 You received an on-chain verification badge! TX: ${response.data.license.txHash.slice(0, 10)}...`);
      } else {
        setSuccess('✅ Verification submitted successfully!');
      }

      // Refresh data
      await fetchPromptDetails();
      await fetchVerifications();
      setVerificationFeedback('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-dark flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto'></div>
          <p className='mt-4 text-gray-400'>Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className='min-h-screen bg-dark flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-400'>{error || 'Prompt not found'}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className='mt-4 text-accent hover:underline'
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isOwner = address && prompt.creator.walletAddress.toLowerCase() === address.toLowerCase();
  const hasVerified = verifications.some(
    (v) => v.user.walletAddress.toLowerCase() === address?.toLowerCase()
  );

  const usefulCount = verifications.filter((v) => v.isUseful).length;

  const handleRemix = () => {
    navigate(`/create?remix=${prompt.id}`);
  };

  return (
    <div className='min-h-screen bg-dark py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Parent Prompt Info (if this is a remix) */}
        {prompt.parentPrompt && (
          <div className='bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6'>
            <p className='text-sm text-accent'>
              🔄 This is a remix of{' '}
              <button
                onClick={() => navigate(`/prompt/${prompt.parentPrompt!.id}`)}
                className='font-semibold underline hover:text-accent/80'
              >
                {prompt.parentPrompt.title}
              </button>
              {' '}by {prompt.parentPrompt.creator.nickname || prompt.parentPrompt.creator.walletAddress.slice(0, 8) + '...'}
            </p>
          </div>
        )}

        {/* Header */}
        <div className='bg-card border border-border rounded-lg p-6 mb-6'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-white mb-2'>{prompt.title}</h1>
              <p className='text-gray-400 mb-4'>{prompt.description}</p>
              
              <div className='flex items-center gap-4 text-sm text-gray-400'>
                <span className='bg-accent/20 text-accent px-3 py-1 rounded-full'>
                  {prompt.category}
                </span>
                <span>By {prompt.creator.nickname || prompt.creator.walletAddress.slice(0, 6) + '...' + prompt.creator.walletAddress.slice(-4)}</span>
                <span>⭐ {prompt.creator.reputationPoints} rep</span>
              </div>
            </div>

            <div className='flex flex-col gap-2 items-end'>
              {prompt.storyIpId && (
                <div className='bg-accent/10 border border-accent/30 px-4 py-2 rounded-lg'>
                  <p className='text-xs text-accent font-medium'>✓ Verified Ownership</p>
                  <p className='text-xs text-gray-500 mt-1'>Story Protocol</p>
                </div>
              )}
              
              {/* Remix Button */}
              {!isOwner && prompt.storyIpId && address && (
                <button
                  onClick={handleRemix}
                  className='bg-accent hover:bg-accent/90 text-black px-4 py-2 rounded-lg text-sm font-medium transition-all'
                >
                  🔄 Remix this Prompt
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scores Section */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-card border border-border rounded-lg p-4 text-center'>
            <p className='text-2xl font-bold text-accent'>{prompt.trustScore.toFixed(1)}%</p>
            <p className='text-sm text-gray-400'>Trust Score</p>
            <p className='text-xs text-gray-500 mt-1'>{usefulCount} / {prompt.verificationCount} useful</p>
          </div>
          <div className='bg-card border border-border rounded-lg p-4 text-center'>
            <p className='text-2xl font-bold text-accent'>{prompt.effectivenessScore.toFixed(1)}%</p>
            <p className='text-sm text-gray-400'>Effectiveness</p>
            <p className='text-xs text-gray-500 mt-1'>Reputation-weighted</p>
          </div>
          <div className='bg-card border border-border rounded-lg p-4 text-center'>
            <p className='text-2xl font-bold text-accent'>{prompt.verificationCount}</p>
            <p className='text-sm text-gray-400'>Verifications</p>
            <p className='text-xs text-gray-500 mt-1'>Community feedback</p>
          </div>
        </div>

        {/* Prompt Content */}
        {prompt.promptText && (
          <div className='bg-card border border-border rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold text-white mb-3'>Prompt</h2>
            <div className='bg-darker p-4 rounded border border-border'>
              <pre className='whitespace-pre-wrap font-mono text-sm text-gray-300'>{prompt.promptText}</pre>
            </div>
          </div>
        )}

        {/* Verification Section */}
        {!isOwner && address && !hasVerified && (
          <div className='bg-card border border-border rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold text-white mb-3'>Verify This Prompt</h2>
            <p className='text-gray-400 mb-4'>
              Have you used this prompt? Help the community by verifying its usefulness!
            </p>

            <textarea
              value={verificationFeedback}
              onChange={(e) => setVerificationFeedback(e.target.value)}
              placeholder='Optional: Share your experience with this prompt...'
              className='w-full px-3 py-2 bg-darker border border-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent mb-4'
              rows={3}
            />

            <div className='flex gap-4'>
              <button
                onClick={() => handleVerify(true)}
                disabled={submitting}
                className='flex-1 bg-accent hover:bg-accent/90 text-black px-6 py-3 rounded-md font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all'
              >
                <span></span> Useful
              </button>
              <button
                onClick={() => handleVerify(false)}
                disabled={submitting}
                className='flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-6 py-3 rounded-md font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all'
              >
                <span></span> Not Useful
              </button>
            </div>

            {error && (
              <p className='mt-2 text-sm text-red-400'>{error}</p>
            )}

            {success && (
              <div className='mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg'>
                <p className='text-sm text-accent'>{success}</p>
              </div>
            )}
          </div>
        )}

        {hasVerified && (
          <div className='bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6'>
            <p className='text-accent'>✅ You have already verified this prompt</p>
            <p className='text-xs text-accent/70 mt-1'>🎫 You own a verification badge for this prompt</p>
          </div>
        )}

        {isOwner && (
          <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6'>
            <p className='text-yellow-500'>You own this prompt - you cannot verify it yourself</p>
          </div>
        )}

        {/* Derivatives (Remixes) Section */}
        {prompt.derivatives && prompt.derivatives.length > 0 && (
          <div className='bg-card border border-border rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold text-white mb-4'>
              🔄 Remixes ({prompt._count?.derivatives || prompt.derivatives.length})
            </h2>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {prompt.derivatives.map((derivative) => (
                <button
                  key={derivative.id}
                  onClick={() => navigate(`/prompt/${derivative.id}`)}
                  className='text-left p-4 bg-darker border border-border rounded-lg hover:border-accent/50 transition-all'
                >
                  <div className='flex items-center justify-between mb-1'>
                    <span className='font-medium text-white'>{derivative.title}</span>
                    {derivative.storyIpId && (
                      <span className='text-xs text-accent'>✓ On-Chain</span>
                    )}
                  </div>
                  <div className='text-sm text-gray-400'>
                    Trust: {derivative.trustScore.toFixed(0)}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Verifications List */}
        {verifications.length > 0 && (
          <div className='bg-card border border-border rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-white mb-4'>Community Feedback ({verifications.length})</h2>
            
            <div className='space-y-4'>
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className={'border-l-4 ' + (verification.isUseful ? 'border-accent' : 'border-red-500') + ' pl-4 py-2'}
                >
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium text-gray-300'>
                      {verification.user.nickname || 
                       verification.user.walletAddress.slice(0, 6) + '...' + verification.user.walletAddress.slice(-4)}
                      {' '}
                      <span className='text-gray-500'>({verification.user.reputationPoints} rep)</span>
                    </span>
                    <span className='text-xs text-gray-500'>
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className='flex items-start gap-2'>
                    <span className='text-lg'>
                      {verification.isUseful ? '' : ''}
                    </span>
                    {verification.feedback && (
                      <p className='text-sm text-gray-400'>{verification.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptDetail;
