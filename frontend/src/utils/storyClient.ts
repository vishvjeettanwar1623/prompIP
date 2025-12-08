import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { http, WalletClient, custom } from 'viem';
import { storyAeneid } from '../wagmi.config';

/**
 * Create a Story Protocol client using the user's wallet client
 * This allows users to sign transactions with their own wallet (MetaMask)
 */
export function createStoryClient(walletClient: WalletClient) {
  if (!walletClient.account) {
    throw new Error('Wallet client account not available');
  }

  // Use custom transport with the wallet's provider for proper MetaMask integration
  const config: StoryConfig = {
    account: walletClient.account,
    transport: custom((walletClient as any).transport),
    chainId: storyAeneid.id,
  };
  
  return StoryClient.newClient(config);
}

// Keep the old function name for backwards compatibility
export const createStoryClientFromWallet = createStoryClient;

