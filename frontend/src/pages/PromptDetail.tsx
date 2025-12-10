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
  const [copied, setCopied] = useState(false);

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
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-2xl mb-4 animate-pulse'>
            <svg className='w-8 h-8 text-primary-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <p className='text-dark-400'>Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-4'>
            <svg className='w-8 h-8 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <p className='text-red-400 mb-4'>{error || 'Prompt not found'}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className='btn-primary'
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
    <div className='min-h-screen py-8'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in'>
        {/* Parent Prompt Info (if this is a remix) */}
        {prompt.parentPrompt && (
          <div className='glass border border-primary-500/30 rounded-xl p-5 mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                <svg className='w-5 h-5 text-primary-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
              </div>
              <p className='text-sm text-primary-400'>
                This is a remix of{' '}
                <button
                  onClick={() => navigate(`/prompt/${prompt.parentPrompt!.id}`)}
                  className='font-semibold underline hover:text-primary-300'
                >
                  {prompt.parentPrompt.title}
                </button>
                {' '}by {prompt.parentPrompt.creator.nickname || prompt.parentPrompt.creator.walletAddress.slice(0, 8) + '...'}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className='card p-8 mb-6'>
          <div className='flex flex-col lg:flex-row gap-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='px-4 py-1.5 bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-semibold rounded-lg'>
                  {prompt.category}
                </span>
                {prompt.storyIpId && (
                  <span className='px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold rounded-lg inline-flex items-center gap-1.5'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                    </svg>
                    On-Chain
                  </span>
                )}
              </div>
              <h1 className='text-3xl md:text-4xl font-display font-bold text-dark-50 mb-3'>{prompt.title}</h1>
              <p className='text-dark-400 text-lg mb-5'>{prompt.description}</p>
              
              <div className='glass border border-dark-700 rounded-xl p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow flex-shrink-0'>
                    <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-dark-400 text-sm'>Created by</p>
                    <p className='text-dark-100 font-semibold'>
                      {prompt.creator.nickname || prompt.creator.walletAddress.slice(0, 6) + '...' + prompt.creator.walletAddress.slice(-4)}
                    </p>
                  </div>
                  <div className='ml-auto text-right'>
                    <p className='text-dark-400 text-sm'>Reputation</p>
                    <p className='text-primary-400 font-bold text-lg'>{prompt.creator.reputationPoints}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Remix Button */}
            {!isOwner && prompt.storyIpId && address && (
              <div className='flex flex-col gap-3'>
                <button
                  onClick={handleRemix}
                  className='btn-primary inline-flex items-center gap-2 justify-center'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                  </svg>
                  Remix this Prompt
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scores Section */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='card p-6 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl mb-3 shadow-glow'>
              <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
              </svg>
            </div>
            <p className='text-3xl font-bold text-gradient mb-1'>{prompt.trustScore.toFixed(1)}%</p>
            <p className='text-sm font-semibold text-dark-200 mb-2'>Trust Score</p>
            <p className='text-xs text-dark-500'>{usefulCount} / {prompt.verificationCount} useful</p>
          </div>
          <div className='card p-6 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl mb-3 shadow-lg'>
              <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
            <p className='text-3xl font-bold text-dark-50 mb-1'>{prompt.effectivenessScore.toFixed(1)}%</p>
            <p className='text-sm font-semibold text-dark-200 mb-2'>Effectiveness</p>
            <p className='text-xs text-dark-500'>Reputation-weighted</p>
          </div>
          <div className='card p-6 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl mb-3 shadow-lg'>
              <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
              </svg>
            </div>
            <p className='text-3xl font-bold text-dark-50 mb-1'>{prompt.verificationCount}</p>
            <p className='text-sm font-semibold text-dark-200 mb-2'>Verifications</p>
            <p className='text-xs text-dark-500'>Community feedback</p>
          </div>
        </div>

        {/* Prompt Content */}
        {prompt.promptText && (
          <div className='card p-8 mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow'>
                  <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <h2 className='text-2xl font-display font-bold text-dark-50'>Prompt Content</h2>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(prompt.promptText || '');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className='btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2'
              >
                {copied ? (
                  <>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className='glass border border-dark-700 rounded-xl p-5'>
              <pre className='whitespace-pre-wrap font-mono text-sm text-dark-200 leading-relaxed'>{prompt.promptText}</pre>
            </div>
          </div>
        )}

        {/* Verification Section */}
        {!isOwner && address && (
          <div className='card p-8 mb-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow'>
                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h2 className='text-2xl font-display font-bold text-dark-50'>Verify This Prompt</h2>
            </div>
            <p className='text-dark-400 mb-5'>
              Have you used this prompt? Help the community by sharing your experience!
            </p>

            <textarea
              value={verificationFeedback}
              onChange={(e) => setVerificationFeedback(e.target.value)}
              placeholder='Optional: Share your experience with this prompt...'
              className='input resize-none mb-5'
              rows={4}
            />

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <button
                onClick={() => handleVerify(true)}
                disabled={submitting}
                className='btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5' />
                </svg>
                {submitting ? 'Submitting...' : 'Mark as Useful'}
              </button>
              <button
                onClick={() => handleVerify(false)}
                disabled={submitting}
                className='px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5' />
                </svg>
                Not Useful
              </button>
            </div>

            {error && (
              <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-4'>
                <div className='flex items-center gap-3'>
                  <svg className='w-5 h-5 text-red-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <p className='text-sm text-red-400'>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className='bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mt-4'>
                <div className='flex items-center gap-3'>
                  <svg className='w-5 h-5 text-primary-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  <p className='text-sm text-primary-400'>{success}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {hasVerified && (
          <div className='glass border border-green-500/30 rounded-xl p-6 mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center'>
                <svg className='w-6 h-6 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <div>
                <p className='text-green-400 font-semibold mb-1'>Verification Submitted</p>
                <p className='text-xs text-dark-400'>You own a verification badge for this prompt</p>
              </div>
            </div>
          </div>
        )}

        {isOwner && (
          <div className='glass border border-yellow-500/30 rounded-xl p-6 mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center'>
                <svg className='w-6 h-6 text-yellow-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <p className='text-yellow-400'>You own this prompt - you cannot verify it yourself</p>
            </div>
          </div>
        )}

        {/* Derivatives (Remixes) Section */}
        {prompt.derivatives && prompt.derivatives.length > 0 && (
          <div className='card p-8 mb-6'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow'>
                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
              </div>
              <h2 className='text-2xl font-display font-bold text-dark-50'>
                Remixes <span className='text-dark-500'>({prompt._count?.derivatives || prompt.derivatives.length})</span>
              </h2>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {prompt.derivatives.map((derivative) => (
                <button
                  key={derivative.id}
                  onClick={() => navigate(`/prompt/${derivative.id}`)}
                  className='glass border border-dark-700 hover:border-primary-500/50 rounded-xl p-5 text-left transition-all group'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <span className='font-semibold text-dark-100 group-hover:text-gradient transition-all'>{derivative.title}</span>
                    {derivative.storyIpId && (
                      <span className='px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg'>
                        On-Chain
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2 text-sm text-dark-400'>
                    <svg className='w-4 h-4 text-primary-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                    </svg>
                    <span>Trust: <span className='font-semibold text-dark-200'>{derivative.trustScore.toFixed(0)}%</span></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Verifications List */}
        {verifications.length > 0 && (
          <div className='card p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-glow'>
                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
              </div>
              <h2 className='text-2xl font-display font-bold text-dark-50'>
                Community Feedback <span className='text-dark-500'>({verifications.length})</span>
              </h2>
            </div>
            
            <div className='space-y-4'>
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className={'glass border rounded-xl p-5 ' + 
                    (verification.isUseful 
                      ? 'border-primary-500/30' 
                      : 'border-red-500/30')}
                >
                  <div className='flex items-start gap-4'>
                    <div className={'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ' +
                      (verification.isUseful
                        ? 'bg-primary-500/20'
                        : 'bg-red-500/20')}
                    >
                      {verification.isUseful ? (
                        <svg className='w-5 h-5 text-primary-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5' />
                        </svg>
                      ) : (
                        <svg className='w-5 h-5 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5' />
                        </svg>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-3 mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-dark-100'>
                            {verification.user.nickname || 
                             verification.user.walletAddress.slice(0, 6) + '...' + verification.user.walletAddress.slice(-4)}
                          </span>
                          <span className='px-2 py-0.5 bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-semibold rounded'>
                            {verification.user.reputationPoints} rep
                          </span>
                        </div>
                        <span className='text-xs text-dark-500 whitespace-nowrap'>
                          {new Date(verification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {verification.feedback && (
                        <p className='text-sm text-dark-400 leading-relaxed'>{verification.feedback}</p>
                      )}
                    </div>
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
