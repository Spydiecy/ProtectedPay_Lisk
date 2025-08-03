// Blockchain explorer utilities

export const getExplorerUrl = (chainId: number): string => {
  switch (chainId) {
    case 4202: // Lisk Sepolia Testnet
      return 'https://sepolia-blockscout.lisk.com'
    default:
      return 'https://sepolia-blockscout.lisk.com' // Lisk Sepolia Testnet
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
    case 4202: return 'Lisk Sepolia'
    default: return `Chain ${chainId}`
  }
}
