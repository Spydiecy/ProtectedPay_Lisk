// Blockchain explorer utilities

export const getExplorerUrl = (chainId: number): string => {
  switch (chainId) {
    case 1043: // BlockDAG Testnet
      return 'https://primordial.bdagscan.com'
    default:
      return 'https://primordial.bdagscan.com' // BlockDAG Testnet
  }
}

export const getTransactionUrl = (txHash: string, chainId: number): string => {
  const baseUrl = getExplorerUrl(chainId)
  return `${baseUrl}/tx/${txHash}`
}

export const getAddressUrl = (address: string, chainId: number): string => {
  const baseUrl = getExplorerUrl(chainId)
  return `${baseUrl}/address/${address}`
}

export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1043: return 'BlockDAG Testnet'
    default: return `Chain ${chainId}`
  }
}
