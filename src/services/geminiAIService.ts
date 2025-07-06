import { GoogleGenerativeAI } from '@google/generative-ai'
import { ethers } from 'ethers'
import { ProtectedPayAIService } from './aiService'
import { getSupportedTokensForChain } from '@/utils/constants'

interface GeminiAIResponse {
  message: string
  action?: {
    type: 'send' | 'claim' | 'refund' | 'balance' | 'transfers' | 'chain_info' | 'supported_tokens' | 'register_username'
    data?: any
  }
  confirmation?: {
    message: string
    data: any
  }
}

interface ConversationContext {
  pendingAction?: {
    type: 'send' | 'claim' | 'refund' | 'register_username'
    data: any
    message: string
  }
  lastResponse?: string
  messageHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }>
}

export class GeminiProtectedPayService {
  private genAI: GoogleGenerativeAI
  private model: any
  private aiService: ProtectedPayAIService
  private conversationContext: ConversationContext
  
  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('Google API key not found. Please set NEXT_PUBLIC_GOOGLE_API_KEY in your environment variables.')
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey)
    // Use Gemini 1.5 Flash model as requested
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    this.aiService = new ProtectedPayAIService()
    this.conversationContext = {
      messageHistory: []
    }
  }

  async processUserMessage(
    userMessage: string,
    context: {
      address?: string
      chainId?: number
      signer?: ethers.Signer
    }
  ): Promise<GeminiAIResponse> {
    try {
      // Add user message to conversation history
      this.conversationContext.messageHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      })

      // Check if this is a confirmation response (yes/no/confirm/cancel)
      const confirmationResponse = this.checkForConfirmationResponse(userMessage)
      if (confirmationResponse !== null) {
        return await this.handleConfirmationResponse(confirmationResponse, context)
      }

      const { address, chainId, signer } = context
      
      // Build conversation history for context
      const conversationHistory = this.conversationContext.messageHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')
      
      // Check if this is a follow-up query based on context
      const lastResponse = this.conversationContext.messageHistory
        .slice(-2) // Look at last 2 messages (user and assistant)
        .filter(msg => msg.role === 'assistant')[0]
      
      // Also check if user mentioned a token and then said "balance"
      const recentTokenMention = this.conversationContext.messageHistory
        .slice(-3) // Look at last 3 messages
        .find(msg => msg.role === 'user' && 
          msg.content.toLowerCase().match(/\b(tusdfc|usdc|usdt|flow|tfil)\b/i))
      
      let contextualPrompt = ''
      if (lastResponse && lastResponse.content.includes('Balance:')) {
        // Previous message was a balance response, check if this is asking for different token or all tokens
        const tokenPatterns = [
          /\b(tusdfc|t-usdfc|tUSDFC|in\s+tusdfc)\b/i,
          /\b(usdc|usd-c|USDC|in\s+usdc)\b/i,
          /\b(usdt|usd-t|USDT|in\s+usdt)\b/i,
          /\b(flow|FLOW|in\s+flow)\b/i,
          /\b(tfil|t-fil|tFIL|in\s+tfil)\b/i
        ]
        
        const allTokenPatterns = [
          /\b(for\s+all|all\s+tokens|all\s+balances|show\s+all)\b/i
        ]
        
        let hasTokenPattern = false
        for (const pattern of tokenPatterns) {
          if (pattern.test(userMessage)) {
            hasTokenPattern = true
            break
          }
        }
        
        let hasAllPattern = false
        for (const pattern of allTokenPatterns) {
          if (pattern.test(userMessage)) {
            hasAllPattern = true
            break
          }
        }
        
        if (hasTokenPattern || hasAllPattern) {
          contextualPrompt = `\nCONTEXT: User just asked for balance and now wants to see ${hasAllPattern ? 'all token balances' : 'a specific token balance'}. Convert this to a balance query.`
        }
      }

      // Create context-aware prompt for Gemini
      const systemPrompt = `You are an AI assistant for ProtectedPay, a blockchain payment system. You help users interact with smart contracts using natural language.

AVAILABLE ACTIONS:
1. CHECK BALANCE - Get token balances for an address
2. SEND TRANSFER - Send protected transfers to addresses or usernames  
3. CLAIM TRANSFER - Claim pending transfers by ID, address, or username
4. REFUND TRANSFER - Refund unclaimed transfers
5. VIEW TRANSFERS - Get pending transfers for an address
6. REGISTER USERNAME - Register a username for the wallet address
7. CHAIN INFO - Get supported blockchain networks
8. SUPPORTED TOKENS - Get supported tokens for a chain

SUPPORTED CHAINS:
- Flow EVM Testnet (Chain ID: 545)
- Flow EVM Mainnet (Chain ID: 747)
- Filecoin Calibration Testnet (Chain ID: 314159)

CURRENT CONTEXT:
- User Address: ${address || 'Not connected'}
- Current Chain: ${chainId || 'Unknown'}
- Wallet: ${signer ? 'Connected' : 'Not connected'}
${this.conversationContext.pendingAction ? `- PENDING ACTION: ${this.conversationContext.pendingAction.type} (waiting for confirmation)` : ''}

CONVERSATION HISTORY:
${conversationHistory}${contextualPrompt}

CURRENT MESSAGE: "${userMessage}"

${recentTokenMention && userMessage.toLowerCase().includes('balance') ? 
  `ADDITIONAL CONTEXT: User previously mentioned token in recent messages. This balance query may be related to that token.` : ''}

INSTRUCTIONS:
1. Analyze the user's request and determine if it requires calling a blockchain function
2. If it's a balance check, transfer operation, username registration, or chain query, specify the action needed
3. Always be helpful and explain what you're doing
4. If the user's request is unclear, ask for clarification
5. For transactions (send, claim, refund, register username), ask for confirmation before proceeding
6. For balance checks and information queries, execute immediately (no confirmation needed)
7. Use friendly, conversational language and maintain context from previous messages

RESPONSE FORMAT:
Provide a helpful response and if action is needed, specify the action type and required data.

Examples:
- "Check my balance" → ACTION: balance check (execute immediately)
- "Send 100 FLOW to 0x123..." → ACTION: send transfer (ask for confirmation)
- "Register username alice" → ACTION: register username (ask for confirmation)
- "What chains are supported?" → ACTION: chain info (execute immediately)
- "Show pending transfers" → ACTION: view transfers (execute immediately)`

      const prompt = `${systemPrompt}\n\nPlease respond to the user's message: "${userMessage}"`
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const geminiResponse = response.text()
      
      // Add assistant response to conversation history
      this.conversationContext.messageHistory.push({
        role: 'assistant',
        content: geminiResponse,
        timestamp: Date.now()
      })
      
      // Parse the response to extract actions
      const action = this.extractActionFromResponse(userMessage, geminiResponse)
      
      if (action) {
        // Execute the action using the AI service
        try {
          const actionResult = await this.executeAction(action, context)
          
          // Balance checks and chain info should return results immediately (no confirmation)
          if (action.type === 'balance' || action.type === 'chain_info' || action.type === 'transfers' || action.type === 'supported_tokens') {
            return {
              message: actionResult.message,
              action: action
            }
          }
          
          // Other actions (send, claim, refund, register_username) require confirmation - store the pending action
          this.conversationContext.pendingAction = {
            type: action.type as 'send' | 'claim' | 'refund' | 'register_username',
            data: action.data,
            message: geminiResponse
          }
          
          return {
            message: geminiResponse,
            action: action,
            confirmation: actionResult
          }
        } catch (error) {
          return {
            message: `${geminiResponse}\n\n❌ **Error executing action**: ${error instanceof Error ? error.message : 'Unknown error'}`,
            action: action
          }
        }
      }
      
      return {
        message: geminiResponse
      }
      
    } catch (error) {
      console.error('Gemini AI Error:', error)
      return {
        message: `❌ **AI Service Error**: ${error instanceof Error ? error.message : 'Failed to process your request. Please try again.'}`
      }
    }
  }

  private extractActionFromResponse(userMessage: string, geminiResponse: string): any {
    const userLower = userMessage.toLowerCase()
    
    // Check for follow-up balance queries based on context
    const lastResponse = this.conversationContext.messageHistory
      .slice(-2)
      .filter(msg => msg.role === 'assistant')[0]
    
    const isFollowUpBalanceQuery = lastResponse && lastResponse.content.includes('Balance:') && 
      (userLower.includes('for all') || userLower.includes('all tokens') || 
       userLower.includes('all balances') || userLower.includes('show all') ||
       userLower.match(/^\s*(tusdfc|usdc|usdt|flow|tfil)\s*$/i) ||
       userLower.match(/\b(in|for)\s+(tusdfc|usdc|usdt|flow|tfil)\b/i) ||
       userLower.match(/^(for|in)\s+(tusdfc|usdc|usdt|flow|tfil)$/i))
    
    // Also check if user mentioned a token and then said "balance"
    const recentTokenMention = this.conversationContext.messageHistory
      .slice(-3) // Look at last 3 messages
      .find(msg => msg.role === 'user' && 
        msg.content.toLowerCase().match(/\b(tusdfc|usdc|usdt|flow|tfil)\b/i))
    
    const isTokenBalanceFollowUp = recentTokenMention && userLower.includes('balance') && 
      !userLower.match(/\b(tusdfc|usdc|usdt|flow|tfil)\b/i)
    
    // Balance check patterns - improved to detect specific tokens and follow-up queries
    if (userLower.includes('balance') || userLower.includes('how much') || 
        userLower.match(/\b(in|my)\s+(tusdfc|usdc|usdt|flow|tfil)\b/i) ||
        userLower.match(/^\s*(tusdfc|usdc|usdt|flow|tfil)\s*$/i) ||
        userLower.includes('for all') || userLower.includes('all tokens') || 
        userLower.includes('all balances') || userLower.includes('show all') ||
        isFollowUpBalanceQuery || isTokenBalanceFollowUp) {
      
      const addressMatch = userMessage.match(/0x[a-fA-F0-9]{40}/)
      const chainMatch = userMessage.match(/chain\s+(\d+)|on\s+(\d+)|testnet|mainnet|flow|filecoin/)
      
      // Extract specific token mentions - improved pattern matching including follow-up queries
      const tokenPatterns = [
        /\b(tusdfc|t-usdfc|tUSDFC|in\s+tusdfc|^\s*tusdfc\s*$)\b/i,  // tUSDFC variations
        /\b(usdc|usd-c|USDC|in\s+usdc|^\s*usdc\s*$)\b/i,            // USDC variations  
        /\b(usdt|usd-t|USDT|in\s+usdt|^\s*usdt\s*$)\b/i,            // USDT variations
        /\b(flow|FLOW|in\s+flow|^\s*flow\s*$)\b/i,                   // FLOW
        /\b(tfil|t-fil|tFIL|in\s+tfil|^\s*tfil\s*$)\b/i             // tFIL variations
      ]
      
      let detectedToken = null
      for (const pattern of tokenPatterns) {
        const match = userMessage.match(pattern)
        if (match) {
          let tokenSymbol = match[1].toUpperCase()
          // Normalize token symbols
          if (tokenSymbol.includes('TUSDFC') || tokenSymbol.includes('T-USDFC')) {
            tokenSymbol = 'tUSDFC'
          } else if (tokenSymbol.includes('TFIL') || tokenSymbol.includes('T-FIL')) {
            tokenSymbol = 'tFIL'
          }
          detectedToken = tokenSymbol
          break
        }
      }
      
      // If no token detected in current message but this is a follow-up to a token mention
      if (!detectedToken && isTokenBalanceFollowUp && recentTokenMention) {
        const tokenMatch = recentTokenMention.content.toLowerCase().match(/\b(tusdfc|usdc|usdt|flow|tfil)\b/i)
        if (tokenMatch) {
          let tokenSymbol = tokenMatch[1].toUpperCase()
          if (tokenSymbol.includes('TUSDFC') || tokenSymbol.includes('T-USDFC')) {
            tokenSymbol = 'tUSDFC'
          } else if (tokenSymbol.includes('TFIL') || tokenSymbol.includes('T-FIL')) {
            tokenSymbol = 'tFIL'
          }
          detectedToken = tokenSymbol
        }
      }
      
      const allBalanceMatch = userLower.includes('all') || userLower.includes('every') || userLower.includes('total') || 
                             userLower.includes('for all') || userLower.includes('all tokens') || userLower.includes('all balances')
      
      return {
        type: 'balance',
        data: {
          address: addressMatch ? addressMatch[0] : null,
          chainId: chainMatch ? (chainMatch[1] || chainMatch[2]) : null,
          token: detectedToken,
          showAll: allBalanceMatch
        }
      }
    }
    
    // Send transfer patterns
    if (userLower.includes('send') && (userLower.includes('to') || userLower.includes('transfer'))) {
      const amountMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*(\w+)?/)
      const addressMatch = userMessage.match(/to\s+(0x[a-fA-F0-9]{40}|\w+)/)
      const messageMatch = userMessage.match(/message[:\s]+"([^"]+)"|note[:\s]+"([^"]+)"/)
      
      return {
        type: 'send',
        data: {
          amount: amountMatch ? amountMatch[1] : null,
          token: amountMatch ? amountMatch[2] : 'FLOW',
          recipient: addressMatch ? addressMatch[1] : null,
          message: messageMatch ? (messageMatch[1] || messageMatch[2]) : ''
        }
      }
    }
    
    // Claim transfer patterns
    if (userLower.includes('claim')) {
      const idMatch = userMessage.match(/id\s+(0x[a-fA-F0-9]+)/)
      const addressMatch = userMessage.match(/from\s+(0x[a-fA-F0-9]{40}|\w+)/)
      
      return {
        type: 'claim',
        data: {
          identifier: idMatch ? idMatch[1] : (addressMatch ? addressMatch[1] : null)
        }
      }
    }
    
    // Refund transfer patterns
    if (userLower.includes('refund')) {
      const idMatch = userMessage.match(/(0x[a-fA-F0-9]+)/)
      
      return {
        type: 'refund',
        data: {
          transferId: idMatch ? idMatch[1] : null
        }
      }
    }
    
    // View transfers patterns
    if (userLower.includes('pending') || userLower.includes('transfers') || userLower.includes('show')) {
      const addressMatch = userMessage.match(/for\s+(0x[a-fA-F0-9]{40})/)
      
      return {
        type: 'transfers',
        data: {
          address: addressMatch ? addressMatch[1] : null
        }
      }
    }
    
    // Chain info patterns
    if (userLower.includes('chain') || userLower.includes('network') || userLower.includes('support')) {
      return {
        type: 'chain_info',
        data: {}
      }
    }
    
    // Supported tokens patterns
    if (userLower.includes('token') && userLower.includes('support')) {
      const chainMatch = userMessage.match(/chain\s+(\d+)|on\s+(\d+)/)
      
      return {
        type: 'supported_tokens',
        data: {
          chainId: chainMatch ? parseInt(chainMatch[1] || chainMatch[2]) : null
        }
      }
    }
    
    // Username registration patterns
    if (userLower.includes('register') && (userLower.includes('username') || userLower.includes('name'))) {
      // Handle various patterns: "register spy as my username", "register username spy", etc.
      const usernameMatch = userMessage.match(/register\s+(?:username\s+)?(\w+)(?:\s+as\s+my\s+username)?|register\s+(\w+)\s+as\s+my\s+(?:username|name)/i)
      
      let username = null
      if (usernameMatch) {
        username = usernameMatch[1] || usernameMatch[2]
      }
      
      return {
        type: 'register_username',
        data: {
          username: username
        }
      }
    }
    
    return null
  }

  private async executeAction(action: any, context: any): Promise<any> {
    const { address, chainId, signer } = context
    
    switch (action.type) {
      case 'balance':
        if (!signer) throw new Error('Wallet not connected')
        const targetAddress = action.data.address || address
        if (!targetAddress) throw new Error('No address specified')
        
        const supportedTokens = getSupportedTokensForChain(chainId || 747)
        
        // Handle specific token request
        if (action.data.token && !action.data.showAll) {
          const requestedToken = supportedTokens.find(t => 
            t.symbol.toLowerCase() === action.data.token.toLowerCase() ||
            t.symbol === action.data.token ||
            (action.data.token === 'tUSDFC' && (t.symbol === 'tUSDFC' || t.symbol === 'USDFC')) ||
            (action.data.token === 'tFIL' && (t.symbol === 'tFIL' || t.symbol === 'FIL'))
          )
          
          if (!requestedToken) {
            return {
              message: `❌ Token ${action.data.token} not supported on ${this.getChainName(chainId)}. Supported tokens: ${supportedTokens.map(t => t.symbol).join(', ')}`,
              data: { error: 'Token not supported' }
            }
          }
          
          const balanceResult = await this.aiService.getBalance(signer, targetAddress, requestedToken)
          
          if (balanceResult.success) {
            return {
              message: `💰 **${requestedToken.symbol} Balance**: ${balanceResult.data?.balance || '0'} ${requestedToken.symbol}\n📍 Address: ${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}\n⛓️ Chain: ${this.getChainName(chainId)}`,
              data: balanceResult.data
            }
          } else {
            throw new Error(balanceResult.error || 'Failed to fetch balance')
          }
        }
        
        // Handle all balances request
        if (action.data.showAll) {
          let allBalances = []
          let totalValue = 0
          
          for (const token of supportedTokens) {
            try {
              const result = await this.aiService.getBalance(signer, targetAddress, token)
              if (result.success && result.data?.balance) {
                const balance = parseFloat(result.data.balance)
                if (balance > 0) {
                  allBalances.push({
                    token: token.symbol,
                    balance: result.data.balance,
                    isNative: token.isNative
                  })
                }
              }
            } catch (error) {
              console.log(`Error fetching ${token.symbol} balance:`, error)
            }
          }
          
          if (allBalances.length === 0) {
            return {
              message: `💰 **All Balances**: No tokens found\n📍 Address: ${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}\n⛓️ Chain: ${this.getChainName(chainId)}`,
              data: { balances: [] }
            }
          }
          
          let balanceText = `💰 **All Token Balances**\n\n`
          allBalances.forEach(bal => {
            balanceText += `• **${bal.token}**: ${bal.balance}${bal.isNative ? ' (Native)' : ''}\n`
          })
          balanceText += `\n📍 Address: ${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}\n⛓️ Chain: ${this.getChainName(chainId)}`
          
          return {
            message: balanceText,
            data: { balances: allBalances }
          }
        }
        
        // Default to native token if no specific token requested
        const nativeToken = supportedTokens.find(t => t.isNative) || supportedTokens[0]
        const balanceResult = await this.aiService.getBalance(signer, targetAddress, nativeToken)
        
        if (balanceResult.success) {
          return {
            message: `💰 **${nativeToken.symbol} Balance**: ${balanceResult.data?.balance || '0'} ${nativeToken.symbol}\n📍 Address: ${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}\n⛓️ Chain: ${this.getChainName(chainId)}`,
            data: balanceResult.data
          }
        } else {
          throw new Error(balanceResult.error || 'Failed to fetch balance')
        }
        
      case 'transfers':
        if (!signer) throw new Error('Wallet not connected')
        const transferAddress = action.data.address || address
        if (!transferAddress) throw new Error('No address specified')
        
        const transfersResult = await this.aiService.getPendingTransfers(signer, transferAddress, chainId || 747)
        
        return {
          message: `📋 Found ${transfersResult.data?.transfers?.length || 0} pending transfers`,
          data: transfersResult.data
        }
        
      case 'chain_info':
        return {
          message: `⛓️ **Supported Chains:**\n• Flow EVM Testnet (ID: 545)\n• Flow EVM Mainnet (ID: 747)\n• Filecoin Calibration (ID: 314159)`,
          data: {
            chains: [
              { name: 'Flow EVM Testnet', id: 545 },
              { name: 'Flow EVM Mainnet', id: 747 },
              { name: 'Filecoin Calibration', id: 314159 }
            ]
          }
        }
        
      case 'send':
        if (!signer) throw new Error('Wallet not connected')
        if (!action.data.recipient || !action.data.amount) {
          throw new Error('Missing recipient or amount for transfer')
        }
        
        // This would require confirmation in the UI
        return {
          message: `🔄 **Transfer Confirmation Required**\nSend ${action.data.amount} ${action.data.token} to ${action.data.recipient}`,
          data: {
            type: 'confirmation_needed',
            action: 'send',
            details: action.data
          }
        }
        
      case 'claim':
        if (!signer) throw new Error('Wallet not connected')
        if (!action.data.identifier) {
          throw new Error('Missing transfer identifier for claim')
        }
        
        return {
          message: `🔄 **Claim Confirmation Required**\nClaim transfer: ${action.data.identifier}`,
          data: {
            type: 'confirmation_needed',
            action: 'claim',
            details: action.data
          }
        }
        
      case 'refund':
        if (!signer) throw new Error('Wallet not connected')
        if (!action.data.transferId) {
          throw new Error('Missing transfer ID for refund')
        }
        
        return {
          message: `🔄 **Refund Confirmation Required**\nRefund transfer: ${action.data.transferId}`,
          data: {
            type: 'confirmation_needed',
            action: 'refund',
            details: action.data
          }
        }
        
      case 'register_username':
        if (!signer) throw new Error('Wallet not connected')
        if (!action.data.username) {
          throw new Error('Missing username for registration')
        }
        
        return {
          message: `🔄 **Username Registration Confirmation Required**\nRegister username "${action.data.username}" for your address`,
          data: {
            type: 'confirmation_needed',
            action: 'register_username',
            details: action.data
          }
        }
        
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // Execute confirmed actions (called after user confirms)
  async executeConfirmedAction(
    action: string,
    data: any,
    context: { signer?: ethers.Signer; chainId?: number }
  ): Promise<any> {
    const { signer, chainId } = context
    if (!signer) throw new Error('Wallet not connected')

    switch (action) {
      case 'send':
        // Get proper token from supported tokens
        const supportedTokens = getSupportedTokensForChain(chainId || 747)
        const token = supportedTokens.find(t => 
          t.symbol.toLowerCase() === (data.token || 'FLOW').toLowerCase()
        ) || supportedTokens.find(t => t.isNative) || supportedTokens[0]
        
        return await this.aiService.sendTransfer(
          signer,
          data.recipient,
          data.amount,
          token,
          data.message || ''
        )
        
      case 'claim':
        return await this.aiService.claimTransfer(signer, data.identifier)
        
      case 'refund':
        return await this.aiService.refundTransfer(signer, data.transferId)
        
      case 'register_username':
        // Import the username registration function
        const { registerUsername } = await import('@/utils/contract')
        await registerUsername(signer, data.username)
        return {
          success: true,
          message: `✅ Username "${data.username}" registered successfully!`,
          data: { username: data.username }
        }
        
      default:
        throw new Error(`Cannot execute action: ${action}`)
    }
  }

  // Method to clear conversation context (useful for debugging)
  clearContext(): void {
    this.conversationContext = {
      messageHistory: []
    }
  }

  // Method to get current context (useful for debugging)
  getContext(): ConversationContext {
    return this.conversationContext
  }

  private getChainName(chainId?: number): string {
    switch (chainId) {
      case 545: return 'Flow EVM Testnet'
      case 747: return 'Flow EVM Mainnet'
      case 314159: return 'Filecoin Calibration Testnet'
      default: return `Chain ${chainId || 'Unknown'}`
    }
  }

  private checkForConfirmationResponse(userMessage: string): boolean | null {
    const lowerInput = userMessage.toLowerCase().trim()
    
    // Positive confirmations
    if (lowerInput === 'yes' || lowerInput === 'y' || lowerInput === 'confirm' || 
        lowerInput === 'ok' || lowerInput === 'proceed' || lowerInput === 'accept') {
      return true
    }
    
    // Negative confirmations
    if (lowerInput === 'no' || lowerInput === 'n' || lowerInput === 'cancel' || 
        lowerInput === 'deny' || lowerInput === 'reject' || lowerInput === 'abort') {
      return false
    }
    
    // Not a confirmation response
    return null
  }

  private async handleConfirmationResponse(
    confirmed: boolean, 
    context: { address?: string; chainId?: number; signer?: ethers.Signer }
  ): Promise<GeminiAIResponse> {
    if (!this.conversationContext.pendingAction) {
      return {
        message: "I don't have any pending actions to confirm. How can I help you with ProtectedPay?"
      }
    }

    if (!confirmed) {
      const pendingAction = this.conversationContext.pendingAction
      this.conversationContext.pendingAction = undefined
      
      let cancelMessage = ''
      switch (pendingAction.type) {
        case 'send':
          cancelMessage = `❌ **Transfer cancelled.** I won't send the transfer.`
          break
        case 'claim':
          cancelMessage = `❌ **Claim cancelled.** I won't claim the transfer.`
          break
        case 'refund':
          cancelMessage = `❌ **Refund cancelled.** I won't refund the transfer.`
          break
        case 'register_username':
          cancelMessage = `❌ **Username registration cancelled.** I won't register the username.`
          break
        default:
          cancelMessage = `❌ **Action cancelled.**`
      }
      
      return {
        message: `${cancelMessage} Let me know if you need help with anything else!`
      }
    }

    // User confirmed - execute the pending action
    const pendingAction = this.conversationContext.pendingAction
    this.conversationContext.pendingAction = undefined

    try {
      const result = await this.executeConfirmedAction(
        pendingAction.type,
        pendingAction.data,
        context
      )

      if (result.success) {
        let successMessage = ''
        switch (pendingAction.type) {
          case 'send':
            successMessage = `✅ **Transfer sent successfully!**\n\n🔗 **Transaction Hash**: ${result.txHash}\n${result.transferId ? `📋 **Transfer ID**: ${result.transferId}\n` : ''}💡 You can view this transaction on the blockchain explorer.`
            break
          case 'claim':
            successMessage = `✅ **Transfer claimed successfully!**\n\n🔗 **Transaction Hash**: ${result.txHash}\n💰 **Amount**: ${result.amount || 'N/A'}`
            break
          case 'refund':
            successMessage = `✅ **Transfer refunded successfully!**\n\n🔗 **Transaction Hash**: ${result.txHash}`
            break
          case 'register_username':
            successMessage = `✅ **Username "${pendingAction.data.username}" registered successfully!**\n\n👤 Your wallet address is now linked to username "${pendingAction.data.username}". Others can send transfers to you using this username instead of your address.`
            break
          default:
            successMessage = `✅ **Action completed successfully!**`
        }
        
        return {
          message: successMessage
        }
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (error) {
      return {
        message: `❌ **Transaction Failed**: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\n` +
                 `Please try again or check your wallet connection.`
      }
    }
  }
}
