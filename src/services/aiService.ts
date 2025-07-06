import { ethers } from 'ethers'
import { 
  sendToAddress,
  sendToUsername,
  claimTransferByAddress,
  claimTransferByUsername,
  claimTransferById,
  refundTransfer,
  getPendingTransfers,
  getTransferDetails,
  sendTokenToAddress,
  sendTokenToUsername,
  claimTokenTransferByAddress,
  claimTokenTransferByUsername,
  claimTokenTransfer,
  refundTokenTransfer,
  getPendingTokenTransfers,
  getTokenTransferDetails,
  getTokenBalance,
  canTransferToken
} from '@/utils/contract'
import { getSupportedTokensForChain, type Token } from '@/utils/constants'

export interface AIServiceResponse {
  success: boolean
  data?: any
  error?: string
  txHash?: string
  transferId?: string
}

export class ProtectedPayAIService {
  
  async sendTransfer(
    signer: ethers.Signer,
    recipient: string,
    amount: string,
    token: Token,
    message: string
  ): Promise<AIServiceResponse> {
    try {
      let result: any
      
      if (token.isNative) {
        if (recipient.startsWith('0x')) {
          result = await sendToAddress(signer, recipient, amount, message)
        } else {
          result = await sendToUsername(signer, recipient, amount, message)
        }
      } else {
        if (recipient.startsWith('0x')) {
          result = await sendTokenToAddress(signer, recipient, token.address, amount, message)
        } else {
          result = await sendTokenToUsername(signer, recipient, token.address, amount, message)
        }
      }
      
      return {
        success: true,
        txHash: result.hash,
        transferId: result.transferId || result.hash,
        data: { recipient, amount, token: token.symbol, message }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      }
    }
  }

  async claimTransfer(
    signer: ethers.Signer,
    identifier: string
  ): Promise<AIServiceResponse> {
    try {
      let result: any
      
      if (identifier.startsWith('0x') && identifier.length === 66) {
        // Transfer ID - try both native and token
        try {
          result = await claimTransferById(signer, identifier)
        } catch (err) {
          result = await claimTokenTransfer(signer, identifier)
        }
      } else if (identifier.startsWith('0x')) {
        // Address - try both native and token
        try {
          result = await claimTransferByAddress(signer, identifier)
        } catch (err) {
          result = await claimTokenTransferByAddress(signer, identifier)
        }
      } else {
        // Username - try both native and token
        try {
          result = await claimTransferByUsername(signer, identifier)
        } catch (err) {
          result = await claimTokenTransferByUsername(signer, identifier)
        }
      }
      
      return {
        success: true,
        txHash: result.hash,
        data: { identifier, amount: result.amount, sender: result.sender }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Claim failed'
      }
    }
  }

  async refundTransfer(
    signer: ethers.Signer,
    transferId: string
  ): Promise<AIServiceResponse> {
    try {
      let result: any
      
      try {
        result = await refundTransfer(signer, transferId)
      } catch (err) {
        result = await refundTokenTransfer(signer, transferId)
      }
      
      return {
        success: true,
        txHash: result.hash,
        data: { transferId, amount: result.amount }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }

  async getBalance(
    signer: ethers.Signer,
    address: string,
    token: Token
  ): Promise<AIServiceResponse> {
    try {
      let balance: string
      
      if (token.isNative) {
        const provider = signer.provider
        if (!provider) throw new Error('No provider available')
        const balanceWei = await provider.getBalance(address)
        balance = (parseInt(balanceWei.toString()) / Math.pow(10, 18)).toString()
      } else {
        balance = await getTokenBalance(signer, token.address, address)
      }
      
      return {
        success: true,
        data: { balance, token: token.symbol, address }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Balance check failed'
      }
    }
  }

  async getPendingTransfers(
    signer: ethers.Signer,
    address: string,
    chainId: number
  ): Promise<AIServiceResponse> {
    try {
      const supportedTokens = getSupportedTokensForChain(chainId)
      
      // Get both native and token transfer IDs
      const [nativeTransferIds, tokenTransferIds] = await Promise.all([
        getPendingTransfers(signer, address),
        getPendingTokenTransfers(signer, address)
      ])

      let allTransfers: any[] = []

      // Process native transfers
      if (nativeTransferIds && nativeTransferIds.length > 0) {
        const nativeTransfers = await Promise.all(
          nativeTransferIds.map(async (id: string) => {
            try {
              const details = await getTransferDetails(signer, id)
              
              return {
                id,
                sender: details.sender || '',
                recipient: details.recipient || '',
                amount: details.amount ? details.amount.toString() : '0',
                timestamp: details.timestamp ? 
                  (typeof details.timestamp === 'number' ? details.timestamp : 
                   details.timestamp.toNumber ? details.timestamp.toNumber() : 
                   details.timestamp.getTime ? details.timestamp.getTime() : 0) : 0,
                remarks: details.remarks || '',
                status: details.status !== undefined ? 
                  (typeof details.status === 'number' ? details.status : 
                   details.status.toNumber ? details.status.toNumber() : 0) : 0,
                isNativeToken: true,
                token: supportedTokens[0] // Native token
              }
            } catch (err) {
              console.error(`Error fetching transfer details for ${id}:`, err)
              return null
            }
          })
        )
        
        const validNativeTransfers = nativeTransfers.filter(transfer => transfer !== null)
        allTransfers = [...allTransfers, ...validNativeTransfers]
      }

      // Process token transfers
      if (tokenTransferIds && tokenTransferIds.length > 0) {
        const tokenTransfers = await Promise.all(
          tokenTransferIds.map(async (id: string) => {
            try {
              const details = await getTokenTransferDetails(signer, id)
              
              // Find token by address
              const token = supportedTokens.find(t => 
                t.address.toLowerCase() === details.token?.toLowerCase()
              ) || supportedTokens[0]
              
              return {
                id,
                sender: details.sender || '',
                recipient: details.recipient || '',
                amount: details.amount ? details.amount.toString() : '0',
                timestamp: details.timestamp ? 
                  (typeof details.timestamp === 'number' ? details.timestamp : 
                   details.timestamp.toNumber ? details.timestamp.toNumber() : 
                   details.timestamp.getTime ? details.timestamp.getTime() : 0) : 0,
                remarks: details.remarks || '',
                status: details.status !== undefined ? 
                  (typeof details.status === 'number' ? details.status : 
                   details.status.toNumber ? details.status.toNumber() : 0) : 0,
                isNativeToken: false,
                token: token
              }
            } catch (err) {
              console.error(`Error fetching token transfer details for ${id}:`, err)
              return null
            }
          })
        )
        
        const validTokenTransfers = tokenTransfers.filter(transfer => transfer !== null)
        allTransfers = [...allTransfers, ...validTokenTransfers]
      }

      // Separate by sender/recipient status
      const receivedTransfers = allTransfers.filter(transfer => 
        transfer.recipient.toLowerCase() === address.toLowerCase()
      )
      const sentTransfers = allTransfers.filter(transfer => 
        transfer.sender.toLowerCase() === address.toLowerCase()
      )

      return {
        success: true,
        data: {
          received: receivedTransfers,
          sent: sentTransfers
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transfers'
      }
    }
  }

  async getAllBalances(
    signer: ethers.Signer,
    address: string,
    chainId: number
  ): Promise<AIServiceResponse> {
    try {
      const supportedTokens = getSupportedTokensForChain(chainId)
      const balances: Record<string, string> = {}
      
      for (const token of supportedTokens) {
        try {
          if (token.isNative) {
            const provider = signer.provider
            if (!provider) continue
            const balanceWei = await provider.getBalance(address)
            balances[token.symbol] = (parseInt(balanceWei.toString()) / Math.pow(10, 18)).toString()
          } else {
            const balance = await getTokenBalance(signer, token.address, address)
            balances[token.symbol] = balance
          }
        } catch (err) {
          console.error(`Error fetching balance for ${token.symbol}:`, err)
          balances[token.symbol] = '0'
        }
      }
      
      return {
        success: true,
        data: { balances, address }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balances'
      }
    }
  }
}
