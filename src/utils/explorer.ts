// Blockchain explorer utilities

export const getExplorerUrl = (chainId: number): string => {
  switch (chainId) {
    case 545: // Flow EVM Testnet
      return 'https://evm-testnet.flowscan.org'
    case 314159: // Filecoin Calibration Testnet
      return 'https://calibration.filfox.info/en'
    case 314: // Filecoin Mainnet
      return 'https://filfox.info/en'
    default:
      return 'https://evm-testnet.flowscan.org' // Default to Flow Testnet
  }
}

export const getTransactionUrl = (txHash: string, chainId: number): string => {
  const baseUrl = getExplorerUrl(chainId)
  
  switch (chainId) {
    case 545: // Flow EVM Testnet
      return `${baseUrl}/tx/${txHash}`
    case 314159: // Filecoin Calibration Testnet
      return `${baseUrl}/message/${txHash}`
    case 314: // Filecoin Mainnet
      return `${baseUrl}/message/${txHash}`
    default:
      return `${baseUrl}/tx/${txHash}`
  }
}

export const getAddressUrl = (address: string, chainId: number): string => {
  const baseUrl = getExplorerUrl(chainId)
  
  switch (chainId) {
    case 545: // Flow EVM Testnet
      return `${baseUrl}/address/${address}`
    case 314159: // Filecoin Calibration Testnet
      return `${baseUrl}/address/${address}`
    case 314: // Filecoin Mainnet
      return `${baseUrl}/address/${address}`
    default:
      return `${baseUrl}/address/${address}`
  }
}

export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 545: return 'Flow EVM Testnet'
    case 314159: return 'Filecoin Calibration Testnet'
    case 314: return 'Filecoin Mainnet'
    default: return `Chain ${chainId}`
  }
}
