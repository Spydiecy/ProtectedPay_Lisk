// utils/constants.ts

export const STATUS_LABELS = {
    0: 'Pending',
    1: 'Completed',
    2: 'Cancelled'
  } as const;
  
  export const STATUS_COLORS = {
    0: 'bg-yellow-500/20 text-yellow-500',
    1: 'bg-green-500/20 text-green-500',
    2: 'bg-red-500/20 text-red-500'
  } as const;
  
  export const POT_STATUS_LABELS = {
    0: 'Active',
    1: 'Broken'
  } as const;
  
  export const POT_STATUS_COLORS = {
    0: 'bg-green-500/20 text-green-500',
    1: 'bg-gray-500/20 text-gray-500'
  } as const;
  
  export const ANIMATION_DURATION = 0.5;
  export const STAGGER_DELAY = 0.1;
  export const MIN_PARTICIPANTS = 2;

// Chain-specific supported tokens for transfers
export const SUPPORTED_TOKENS_BY_CHAIN: Record<number, Array<{
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  isNative: boolean;
}>> = {
  // Lisk Sepolia Testnet
  4202: [
    {
      address: 'NATIVE',
      symbol: 'ETH',
      name: 'ETH (Native)',
      decimals: 18,
      logo: '/chains/eth.svg',
      isNative: true
    },
    {
      address: '0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D',
      symbol: 'LSK',
      name: 'Lisk Token',
      decimals: 18,
      logo: '/chains/lisk.svg',
      isNative: false
    }
  ]
} as const;

// Legacy support - defaults to Lisk Sepolia tokens
export const SUPPORTED_TOKENS = SUPPORTED_TOKENS_BY_CHAIN[4202];

// Helper function to get supported tokens for a specific chain
export const getSupportedTokensForChain = (chainId: number) => {
  return SUPPORTED_TOKENS_BY_CHAIN[chainId] || SUPPORTED_TOKENS_BY_CHAIN[4202]; // Default to Lisk Sepolia
};

export type Token = typeof SUPPORTED_TOKENS[number];