import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { defineChain } from 'viem';

// Define Story Protocol Aeneid testnet
export const storyAeneid = defineChain({
  id: 1315, // Story Aeneid testnet chain ID (0x523)
  name: 'Story Aeneid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://aeneid.storyrpc.io'],
    },
    public: {
      http: ['https://aeneid.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://aeneid.storyscan.xyz' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'PrompIP',
  projectId: '2470b68492f302817df0919bfba8383f', // Placeholder - get real one from cloud.walletconnect.com
  chains: [storyAeneid],
  transports: {
    [storyAeneid.id]: http(),
  },
});
