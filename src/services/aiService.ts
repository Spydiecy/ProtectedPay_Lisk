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
  canTransferToken,
  getUserProfile,
  getUserTransfers,
  getUserTokenTransfers
} from '@/utils/contract'
import { getSupportedTokensForChain, type Token } from '@/utils/constants'

interface AIServiceResponse {
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

  async getCompleteTransferHistory(
    signer: ethers.Signer,
    address: string,
    chainId: number
  ): Promise<AIServiceResponse> {
    try {
      const supportedTokens = getSupportedTokensForChain(chainId)
      
      // Get complete transfer history using getUserTransfers and getUserProfile
      const [userProfile, allNativeTransfers, allTokenTransfers] = await Promise.all([
        getUserProfile(signer, address),
        getUserTransfers(signer, address),
        getUserTokenTransfers(signer, address)
      ])

      let allTransfers: any[] = []

      // Process native transfers
      if (allNativeTransfers && allNativeTransfers.length > 0) {
        const nativeTransfersFormatted = allNativeTransfers.map(transfer => ({
          id: `${transfer.sender}-${transfer.recipient}-${transfer.timestamp}`, // Generate ID
          sender: transfer.sender || '',
          recipient: transfer.recipient || '',
          amount: transfer.amount ? transfer.amount.toString() : '0',
          timestamp: transfer.timestamp || 0,
          remarks: transfer.remarks || '',
          status: transfer.status !== undefined ? transfer.status : 0,
          isNativeToken: true,
          token: supportedTokens[0] // Native token
        }))
        
        allTransfers = [...allTransfers, ...nativeTransfersFormatted]
      }

      // Process token transfers (get all token transfers, not just pending ones)
      if (allTokenTransfers && allTokenTransfers.length > 0) {
        const tokenTransfersFormatted = allTokenTransfers.map((transfer: any) => {
          // Find token by address
          const token = supportedTokens.find(t => 
            t.address.toLowerCase() === transfer.token?.toLowerCase()
          ) || supportedTokens[0]
          
          return {
            id: `${transfer.sender}-${transfer.recipient}-${transfer.timestamp}-token`, // Generate ID
            sender: transfer.sender || '',
            recipient: transfer.recipient || '',
            amount: transfer.amount ? transfer.amount.toString() : '0',
            timestamp: transfer.timestamp || 0,
            remarks: transfer.remarks || '',
            status: transfer.status !== undefined ? transfer.status : 0,
            isNativeToken: false,
            token: token
          }
        })
        
        allTransfers = [...allTransfers, ...tokenTransfersFormatted]
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

  // Group Payment Methods
  async createGroupPayment(
    signer: ethers.Signer,
    recipient: string,
    numParticipants: number,
    amount: string,
    remarks: string
  ): Promise<AIServiceResponse> {
    try {
      const { createGroupPayment } = await import('@/utils/contract')
      const result = await createGroupPayment(signer, recipient, numParticipants, amount, remarks)
      
      return {
        success: true,
        txHash: result.hash,
        data: { recipient, numParticipants, amount, remarks }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create group payment'
      }
    }
  }

  async contributeToGroupPayment(
    signer: ethers.Signer,
    paymentId: string,
    amount: string
  ): Promise<AIServiceResponse> {
    try {
      const { contributeToGroupPayment } = await import('@/utils/contract')
      const result = await contributeToGroupPayment(signer, paymentId, amount)
      
      return {
        success: true,
        txHash: result.hash,
        data: { paymentId, amount }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to contribute to group payment'
      }
    }
  }

  async getGroupPayments(
    signer: ethers.Signer,
    address: string
  ): Promise<AIServiceResponse> {
    try {
      const { getUserProfile, getGroupPaymentDetails } = await import('@/utils/contract')
      const profile = await getUserProfile(signer, address)
      
      // Get details for each group payment
      const payments = await Promise.all(
        profile.groupPaymentIds.map(async (id: string) => {
          try {
            return await getGroupPaymentDetails(signer, id)
          } catch (err) {
            console.error(`Error fetching group payment ${id}:`, err)
            return null
          }
        })
      )
      
      return {
        success: true,
        data: { payments: payments.filter(p => p !== null) }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch group payments'
      }
    }
  }

  // Savings Pot Methods
  async createSavingsPot(
    signer: ethers.Signer,
    name: string,
    targetAmount: string,
    remarks: string
  ): Promise<AIServiceResponse> {
    try {
      const { createSavingsPot } = await import('@/utils/contract')
      const result = await createSavingsPot(signer, name, targetAmount, remarks)
      
      return {
        success: true,
        txHash: result.hash,
        data: { name, targetAmount, remarks }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create savings pot'
      }
    }
  }

  async contributeToSavingsPot(
    signer: ethers.Signer,
    potId: string,
    amount: string
  ): Promise<AIServiceResponse> {
    try {
      const { contributeToSavingsPot } = await import('@/utils/contract')
      const result = await contributeToSavingsPot(signer, potId, amount)
      
      return {
        success: true,
        txHash: result.hash,
        data: { potId, amount }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to contribute to savings pot'
      }
    }
  }

  async breakSavingsPot(
    signer: ethers.Signer,
    potId: string
  ): Promise<AIServiceResponse> {
    try {
      const { breakPot } = await import('@/utils/contract')
      const result = await breakPot(signer, potId)
      
      return {
        success: true,
        txHash: result.hash,
        data: { potId }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to break savings pot'
      }
    }
  }

  async getSavingsPots(
    signer: ethers.Signer,
    address: string
  ): Promise<AIServiceResponse> {
    try {
      const { getUserProfile, getSavingsPotDetails } = await import('@/utils/contract')
      const profile = await getUserProfile(signer, address)
      
      // Get details for each savings pot
      const pots = await Promise.all(
        profile.savingsPotIds.map(async (id: string) => {
          try {
            return await getSavingsPotDetails(signer, id)
          } catch (err) {
            console.error(`Error fetching savings pot ${id}:`, err)
            return null
          }
        })
      )
      
      return {
        success: true,
        data: { pots: pots.filter(p => p !== null) }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch savings pots'
      }
    }
  }

  // Transaction History Methods
  async getTransactionHistory(
    signer: ethers.Signer,
    address: string,
    chainId: number,
    filters?: {
      type?: 'all' | 'transfers' | 'group_payments' | 'savings_pots'
      status?: 'all' | 'pending' | 'completed' | 'refunded'
      direction?: 'all' | 'sent' | 'received'
      token?: string
    }
  ): Promise<AIServiceResponse> {
    try {
      // Get all types of transactions
      const [transfers, groupPayments, savingsPots] = await Promise.all([
        this.getCompleteTransferHistory(signer, address, chainId),
        this.getGroupPayments(signer, address),
        this.getSavingsPots(signer, address)
      ])

      let filteredData = {
        transfers: transfers.data || { received: [], sent: [] },
        groupPayments: groupPayments.data?.payments || [],
        savingsPots: savingsPots.data?.pots || []
      }

      // Apply filters if provided
      if (filters) {
        filteredData = this.applyFilters(filteredData, filters)
      }

      return {
        success: true,
        data: filteredData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction history'
      }
    }
  }

  private applyFilters(data: any, filters: any): any {
    let filtered = { ...data }

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      if (filters.type === 'transfers') {
        filtered.groupPayments = []
        filtered.savingsPots = []
      } else if (filters.type === 'group_payments') {
        filtered.transfers = { received: [], sent: [] }
        filtered.savingsPots = []
      } else if (filters.type === 'savings_pots') {
        filtered.transfers = { received: [], sent: [] }
        filtered.groupPayments = []
      }
    }

    // Filter transfers by status
    if (filters.status && filters.status !== 'all') {
      if (filtered.transfers.received) {
        filtered.transfers.received = filtered.transfers.received.filter((transfer: any) => {
          if (filters.status === 'pending') return transfer.status === 0 || transfer.status === 1
          if (filters.status === 'completed') return transfer.status === 2
          if (filters.status === 'refunded') return transfer.status === 3
          return true
        })
      }
      if (filtered.transfers.sent) {
        filtered.transfers.sent = filtered.transfers.sent.filter((transfer: any) => {
          if (filters.status === 'pending') return transfer.status === 0 || transfer.status === 1
          if (filters.status === 'completed') return transfer.status === 2
          if (filters.status === 'refunded') return transfer.status === 3
          return true
        })
      }
    }

    // Filter by direction
    if (filters.direction && filters.direction !== 'all') {
      if (filters.direction === 'sent') {
        filtered.transfers.received = []
      } else if (filters.direction === 'received') {
        filtered.transfers.sent = []
      }
    }

    // Filter by token
    if (filters.token) {
      const tokenLower = filters.token.toLowerCase()
      if (filtered.transfers.received) {
        filtered.transfers.received = filtered.transfers.received.filter((transfer: any) => 
          transfer.token?.symbol?.toLowerCase() === tokenLower
        )
      }
      if (filtered.transfers.sent) {
        filtered.transfers.sent = filtered.transfers.sent.filter((transfer: any) => 
          transfer.token?.symbol?.toLowerCase() === tokenLower
        )
      }
    }

    return filtered
  }

  async getFilteredTransactions(
    signer: ethers.Signer,
    address: string,
    chainId: number,
    filterQuery: string
  ): Promise<AIServiceResponse> {
    try {
      // Parse natural language filter query
      const filters = this.parseFilterQuery(filterQuery)
      return await this.getTransactionHistory(signer, address, chainId, filters)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply filters'
      }
    }
  }

  private parseFilterQuery(query: string): any {
    const queryLower = query.toLowerCase()
    const filters: any = {}

    // Parse status filters
    if (queryLower.includes('refunded') || queryLower.includes('refund')) {
      filters.status = 'refunded'
    } else if (queryLower.includes('completed') || queryLower.includes('complete') || queryLower.includes('claimed')) {
      filters.status = 'completed'
    } else if (queryLower.includes('pending') || queryLower.includes('unclaimed')) {
      filters.status = 'pending'
    }

    // Parse direction filters
    if (queryLower.includes('sent') || queryLower.includes('outgoing') || queryLower.includes('i sent')) {
      filters.direction = 'sent'
    } else if (queryLower.includes('received') || queryLower.includes('incoming') || queryLower.includes('i received')) {
      filters.direction = 'received'
    }

    // Parse type filters
    if (queryLower.includes('group payment') || queryLower.includes('group')) {
      filters.type = 'group_payments'
    } else if (queryLower.includes('savings') || queryLower.includes('pot')) {
      filters.type = 'savings_pots'
    } else if (queryLower.includes('transfer') && !queryLower.includes('group') && !queryLower.includes('savings')) {
      filters.type = 'transfers'
    }

    // Parse token filters
    const tokenPatterns = [
      { pattern: /\b(eth|ethereum)\b/i, token: 'ETH' },
      { pattern: /\b(lsk|lisk)\b/i, token: 'LSK' }
    ]

    for (const { pattern, token } of tokenPatterns) {
      if (pattern.test(queryLower)) {
        filters.token = token
        break
      }
    }

    return filters
  }

  // Keep this method for backward compatibility
  async getPendingTransfers(
    signer: ethers.Signer,
    address: string,
    chainId: number
  ): Promise<AIServiceResponse> {
    // For backward compatibility, filter only pending transfers
    const result = await this.getCompleteTransferHistory(signer, address, chainId)
    if (result.success && result.data) {
      // Filter only pending transfers (status 0 or 1)
      const pendingReceived = result.data.received.filter((t: any) => t.status === 0 || t.status === 1)
      const pendingSent = result.data.sent.filter((t: any) => t.status === 0 || t.status === 1)
      
      return {
        success: true,
        data: {
          received: pendingReceived,
          sent: pendingSent
        }
      }
    }
    return result
  }
}
