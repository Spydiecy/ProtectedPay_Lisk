import { useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletContext';

export interface ChainInfo {
  chainId: number | undefined;
  nativeToken: string;
  chainName: string;
}

// Map of chain IDs to their native tokens
const TOKEN_MAP: Record<number, string> = {
  4202: "ETH", // Lisk Sepolia
};

// Map of chain IDs to their names
const CHAIN_NAME_MAP: Record<number, string> = {
  4202: "Lisk Sepolia",
};

/**
 * Hook to provide chain-specific information
 */
export function useChain(): ChainInfo {
  // Use the wallet context directly
  const wallet = useWallet();  const [chainInfo, setChainInfo] = useState<ChainInfo>({
    chainId: undefined,
    nativeToken: "ETH",
    chainName: "Lisk Sepolia"
  });

  useEffect(() => {
    // Type-safe approach to accessing window.ethereum
    const getChainInfo = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Safe access with type assertion
          const ethereum = window.ethereum as any;
          if (ethereum && ethereum.chainId) {
            const chainId = parseInt(ethereum.chainId, 16);            setChainInfo({
              chainId,
              nativeToken: TOKEN_MAP[chainId] || "ETH",
              chainName: CHAIN_NAME_MAP[chainId] || "Lisk Sepolia"
            });
          }
        } catch (error) {
          console.error("Error accessing ethereum provider:", error);
        }
      }
    };

    // Initial check
    getChainInfo();

    // Set up event listener for chain changes if ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum as any;
      const handleChainChanged = (chainId: string) => {
        const id = parseInt(chainId, 16);        setChainInfo({
          chainId: id,
          nativeToken: TOKEN_MAP[id] || "ETH",
          chainName: CHAIN_NAME_MAP[id] || "Lisk Sepolia"
        });
      };

      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [wallet.isConnected]);

  return chainInfo;
}
