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

// Supported ERC20 tokens for transfers
export const SUPPORTED_TOKENS = [
  {
    address: 'NATIVE',
    symbol: 'XRP',
    name: 'XRP (Native)',
    decimals: 18,
    logo: '/chains/xrp.png',
    isNative: true
  },
  {
    address: '0x81Be083099c2C65b062378E74Fa8469644347BB7',
    symbol: 'WXRP',
    name: 'Wrapped XRP',
    decimals: 18,
    logo: '/chains/xrp.png',
    isNative: false
  },
  {
    address: '0x925965a6FCe11D0589dAD8972e7e5B8879bCb9ef',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '/chains/usdc.png',
    isNative: false
  },
  {
    address: '0x61F16049EBdC3BB505b0dBeeb31DE09C3AEf53f7',
    symbol: 'RLUSD',
    name: 'Reliable USD',
    decimals: 6,
    logo: '/chains/rlusd.png',
    isNative: false
  }
] as const;

export type Token = typeof SUPPORTED_TOKENS[number];