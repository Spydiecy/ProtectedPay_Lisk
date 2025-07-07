'use client'

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline'
import { useWallet } from '@/context/WalletContext'
import { useChain } from '@/hooks/useChain'
import { getSupportedTokensForChain } from '@/utils/constants'
import { formatAmount, truncateAddress } from '@/utils/helpers'
import { ProtectedPayAIService } from '@/services/aiService'
import { GeminiProtectedPayService } from '@/services/geminiAIService'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  metadata?: {
    txHash?: string
    transferId?: string
    amount?: string
    token?: string
    action?: string
  }
}

interface AIResponse {
  message: string
  action?: {
    type: 'send' | 'claim' | 'refund' | 'balance' | 'transfers'
    data?: any
  }
  confirmation?: {
    message: string
    data: any
  }
}

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `👋 **Welcome to ProtectedPay AI Assistant!**

I can help you with:
• 💸 Send protected transfers - "Send 10 FLOW to 0x1234..."
• 📥 Claim transfers - "Claim transfer from Alice"
• 🔄 Refund transfers - "Refund transfer ID 0xabc..."
• 💰 Check balances - "What's my USDC balance?"
• 📋 View transfers - "Show my pending transfers"
• 👤 Register username - "Register username alice"
• ⛓️ Chain info** - "What tokens are supported on Flow?"

Just tell me what you'd like to do! Make sure your wallet is connected and you're on the right network.`,
      timestamp: new Date(),
    },
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  
  const { address, signer } = useWallet()
  const { chainId } = useChain()
  const supportedTokens = getSupportedTokensForChain(chainId || 545)
  
  // Initialize AI services
  const aiService = new ProtectedPayAIService()
  const geminiService = new GeminiProtectedPayService()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          console.log('Speech recognition started')
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          console.log('Speech result:', transcript)
          setInput(transcript)
          setIsListening(false)
        }

        recognition.onend = () => {
          console.log('Speech recognition ended')
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          
          // Handle specific errors
          if (event.error === 'not-allowed') {
            console.warn('Microphone permission denied')
          } else if (event.error === 'no-speech') {
            console.warn('No speech detected')
          }
        }

        recognitionRef.current = recognition
      } else {
        console.log('Speech recognition not supported')
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [])

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
  }

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ))
  }

  const startSpeechRecognition = () => {
    if (recognitionRef.current && speechSupported && !isListening) {
      try {
        console.log('Attempting to start speech recognition...')
        recognitionRef.current.start()
      } catch (error: any) {
        console.error('Error starting speech recognition:', error)
        setIsListening(false)
        // If recognition is already running, stop it first then start
        if (error.name === 'InvalidStateError') {
          recognitionRef.current.stop()
          setTimeout(() => {
            try {
              recognitionRef.current.start()
            } catch (retryError) {
              console.error('Retry failed:', retryError)
              setIsListening(false)
            }
          }, 100)
        }
      }
    } else {
      console.warn('Cannot start speech recognition:', {
        hasRecognition: !!recognitionRef.current,
        speechSupported,
        isListening
      })
    }
  }

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        console.log('Stopping speech recognition...')
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
      setIsListening(false)
    }
  }

  const parseUserInput = (input: string): AIResponse => {
    const lowerInput = input.toLowerCase()
    
    // Balance queries
    if (lowerInput.includes('balance') || lowerInput.includes('how much')) {
      const tokenMatch = supportedTokens.find(token => 
        lowerInput.includes(token.symbol.toLowerCase())
      )
      return {
        message: `I'll check your ${tokenMatch?.symbol || 'native'} balance...`,
        action: {
          type: 'balance',
          data: { token: tokenMatch }
        }
      }
    }
    
    // Send transfer
    if (lowerInput.includes('send') || lowerInput.includes('transfer')) {
      // Extract amount
      const amountMatch = input.match(/(\d+\.?\d*)\s*(flow|usdc|usdt|tfil|tusdfc|fil)/i)
      // Extract address or username
      const addressMatch = input.match(/(0x[a-fA-F0-9]{40})|(@?\w+)/g)
      
      if (amountMatch && addressMatch) {
        const amount = amountMatch[1]
        const tokenSymbol = amountMatch[2].toUpperCase()
        const recipient = addressMatch[addressMatch.length - 1] // Last match is likely recipient
        
        const token = supportedTokens.find(t => 
          t.symbol.toUpperCase() === tokenSymbol
        )
        
        if (token) {
          return {
            message: `I'll help you send ${amount} ${tokenSymbol} to ${recipient}`,
            confirmation: {
              message: `Please confirm: Send ${amount} ${tokenSymbol} to ${recipient}?`,
              data: { amount, token, recipient, message: 'Sent via AI Assistant' }
            }
          }
        }
      }
      
      return {
        message: 'Please specify the amount, token, and recipient. For example: "Send 10 FLOW to 0x1234..." or "Send 100 USDC to alice"'
      }
    }
    
    // Claim transfer
    if (lowerInput.includes('claim')) {
      const idMatch = input.match(/0x[a-fA-F0-9]{64}/)
      const addressMatch = input.match(/0x[a-fA-F0-9]{40}/)
      const usernameMatch = input.match(/@?(\w+)/)
      
      const identifier = idMatch?.[0] || addressMatch?.[0] || usernameMatch?.[1]
      
      if (identifier) {
        return {
          message: `I'll help you claim the transfer from ${identifier}`,
          confirmation: {
            message: `Confirm claiming transfer from ${identifier}?`,
            data: { identifier }
          }
        }
      }
      
      return {
        message: 'Please specify who to claim from. For example: "Claim from alice" or "Claim transfer 0x1234..."'
      }
    }
    
    // Refund transfer
    if (lowerInput.includes('refund')) {
      const idMatch = input.match(/0x[a-fA-F0-9]{64}/)
      
      if (idMatch) {
        return {
          message: `I'll help you refund transfer ${truncateAddress(idMatch[0])}`,
          confirmation: {
            message: `Confirm refunding transfer ${truncateAddress(idMatch[0])}?`,
            data: { transferId: idMatch[0] }
          }
        }
      }
      
      return {
        message: 'Please provide the transfer ID to refund. For example: "Refund transfer 0x1234..."'
      }
    }
    
    // View transfers
    if (lowerInput.includes('pending') || lowerInput.includes('transfers') || lowerInput.includes('history')) {
      return {
        message: "I'll show your pending transfers...",
        action: {
          type: 'transfers'
        }
      }
    }
    
    // Supported tokens/chains
    if (lowerInput.includes('token') || lowerInput.includes('support') || lowerInput.includes('chain')) {
      const tokensText = supportedTokens.map(token => 
        `• **${token.symbol}** - ${token.name} ${token.isNative ? '(Native)' : ''}`
      ).join('\n')
      
      return {
        message: `**Supported tokens on this chain:**\n\n${tokensText}\n\nYou can send any of these tokens using protected transfers!`
      }
    }
    
    // Help
    if (lowerInput.includes('help') || lowerInput.includes('what') || lowerInput.includes('how')) {
      return {
        message: `**Here's what I can help you with:**

🔗 Sending: "Send 10 FLOW to 0x1234..." or "Send 100 USDC to alice"
📥 Claiming: "Claim from alice" or "Claim transfer 0x1234..."
🔄 **Refunding: "Refund transfer 0x1234..."
💰 **Balances: "What's my USDC balance?" or "Show my balance"
📋 **Transfers**: "Show my pending transfers"
⛓️ **Tokens**: "What tokens are supported?"

All transfers are protected - recipients must claim them, and you can refund unclaimed transfers anytime!`
      }
    }
    
    // Default response
    return {
      message: `I'm not sure how to help with that. Try asking me to:
• Send a transfer: "Send 10 FLOW to 0x1234..."
• Check balance: "What's my FLOW balance?"
• View transfers: "Show my pending transfers"
• Get help: "What can you do?"

Make sure your wallet is connected!`
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userInput = input.trim()
    setInput('')
    
    // Add user message
    addMessage({
      type: 'user',
      content: userInput,
    })
    
    setIsLoading(true)
    
    try {
      // Use Gemini to process the user input
      const response = await geminiService.processUserMessage(userInput, {
        address: address || undefined,
        chainId,
        signer: signer || undefined
      })
      
      if (response.confirmation) {
        setPendingConfirmation(response.confirmation)
        addMessage({
          type: 'assistant',
          content: response.message,
        })
      } else if (response.action) {
        // Show the AI response and any action results
        addMessage({
          type: 'assistant',
          content: response.message,
          metadata: response.action.data
        })
      } else {
        // Simple response from Gemini
        addMessage({
          type: 'assistant',
          content: response.message,
        })
      }
    } catch (error) {
      addMessage({
        type: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const executeAction = async (action: any, initialMessage: string) => {
    const messageId = Date.now().toString()
    
    const newMessage: Message = {
      type: 'assistant',
      content: initialMessage,
      status: 'sending',
      id: messageId,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
    
    try {
      switch (action.type) {
        case 'balance':
          await handleBalanceCheck(messageId, action.data?.token)
          break
        case 'transfers':
          await handleTransfersView(messageId)
          break
        default:
          updateMessage(messageId, {
            content: '❌ Action not implemented yet',
            status: 'error',
          })
      }
    } catch (error) {
      updateMessage(messageId, {
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Action failed'}`,
        status: 'error',
      })
    }
  }

  const handleBalanceCheck = async (messageId: string, token?: any) => {
    if (!address || !signer) {
      updateMessage(messageId, {
        content: '❌ Please connect your wallet first',
        status: 'error',
      })
      return
    }
    
    try {
      if (token) {
        // Check specific token balance
        const result = await aiService.getBalance(signer, address, token)
        
        if (result.success && result.data) {
          updateMessage(messageId, {
            content: `💰 **Your ${token.symbol} Balance**

• **${token.symbol}**: ${formatAmount(result.data.balance)}
• **Address**: ${truncateAddress(address)}
• **Chain**: ${chainId === 545 ? 'Flow Testnet' : 'Filecoin Calibration'}

Need to send or receive funds? Just ask me!`,
            status: 'sent',
          })
        } else {
          throw new Error(result.error || 'Failed to fetch balance')
        }
      } else {
        // Check all balances
        const result = await aiService.getAllBalances(signer, address, chainId || 545)
        
        if (result.success && result.data) {
          const balances = result.data.balances
          let balanceText = `💰 **Your Balances**\n\n`
          
          for (const [symbol, balance] of Object.entries(balances)) {
            balanceText += `• **${symbol}**: ${formatAmount(balance as string)}\n`
          }
          
          balanceText += `\n• **Address**: ${truncateAddress(address)}\n`
          balanceText += `• **Chain**: ${chainId === 545 ? 'Flow Testnet' : 'Filecoin Calibration'}\n\n`
          balanceText += `Need to send or receive funds? Just ask me!`
          
          updateMessage(messageId, {
            content: balanceText,
            status: 'sent',
          })
        } else {
          throw new Error(result.error || 'Failed to fetch balances')
        }
      }
    } catch (error) {
      updateMessage(messageId, {
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Failed to fetch balance'}`,
        status: 'error',
      })
    }
  }

  const handleTransfersView = async (messageId: string) => {
    if (!address || !signer) {
      updateMessage(messageId, {
        content: '❌ Please connect your wallet first',
        status: 'error',
      })
      return
    }
    
    try {
      const result = await aiService.getPendingTransfers(signer, address, chainId || 545)
      
      if (result.success && result.data) {
        const { received, sent } = result.data
        let text = '📋 **Your Pending Transfers**\n\n'
        
        if (received.length === 0 && sent.length === 0) {
          text += 'No pending transfers found.'
        } else {
          if (received.length > 0) {
            text += `**📥 Transfers to Claim (${received.length}):**\n`
            received.forEach((transfer: any, index: number) => {
              text += `${index + 1}. ${formatAmount(transfer.amount)} ${transfer.token?.symbol || 'FLOW'} from ${truncateAddress(transfer.sender)}\n`
              text += `   • Transfer ID: ${truncateAddress(transfer.id)}\n`
              text += `   • Message: ${transfer.remarks || "No message"}\n`
              text += `   • Date: ${new Date(transfer.timestamp * 1000).toLocaleDateString()}\n\n`
            })
          }

          if (sent.length > 0) {
            text += `**📤 Transfers You Can Refund (${sent.length}):**\n`
            sent.forEach((transfer: any, index: number) => {
              text += `${index + 1}. ${formatAmount(transfer.amount)} ${transfer.token?.symbol || 'FLOW'} to ${truncateAddress(transfer.recipient)}\n`
              text += `   • Transfer ID: ${truncateAddress(transfer.id)}\n`
              text += `   • Message: ${transfer.remarks || "No message"}\n`
              text += `   • Date: ${new Date(transfer.timestamp * 1000).toLocaleDateString()}\n\n`
            })
          }
          
          text += '💡 Say "Claim from 0x1234..." or "Refund transfer 0x5678..." to take action!'
        }
        
        updateMessage(messageId, {
          content: text,
          status: 'sent',
        })
      } else {
        throw new Error(result.error || 'Failed to fetch transfers')
      }
    } catch (error) {
      updateMessage(messageId, {
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Failed to fetch transfers'}`,
        status: 'error',
      })
    }
  }

  const handleConfirmation = async (confirmed: boolean) => {
    if (!pendingConfirmation) return

    if (!confirmed) {
      addMessage({
        type: 'assistant',
        content: '❌ **Action cancelled.** Let me know if you need help with anything else!',
      })
      setPendingConfirmation(null)
      return
    }

    if (!signer) {
      addMessage({
        type: 'assistant',
        content: '❌ Please connect your wallet first',
      })
      setPendingConfirmation(null)
      return
    }

    const messageId = Date.now().toString()
    const { data } = pendingConfirmation

    const newMessage: Message = {
      type: 'assistant',
      content: '⏳ **Processing transaction...** Please confirm in your wallet.',
      status: 'sending',
      id: messageId,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])

    try {
      let result: any

      // Use Gemini service to execute the confirmed action
      if (data.type === 'confirmation_needed') {
        result = await geminiService.executeConfirmedAction(
          data.action,
          data.details,
          { signer, chainId }
        )
      } else {
        // Legacy format - try to determine action type
        if (data.recipient) {
          // Send transfer
          result = await aiService.sendTransfer(
            signer,
            data.recipient,
            data.amount,
            data.token,
            data.message || 'Sent via AI Assistant'
          )
        } else if (data.identifier) {
          // Claim transfer
          result = await aiService.claimTransfer(signer, data.identifier)
        } else if (data.transferId) {
          // Refund transfer
          result = await aiService.refundTransfer(signer, data.transferId)
        }
      }
        
      if (result && result.success) {
        let successMessage = '✅ **Transaction successful!**\n\n'
        
        if (result.txHash) {
          successMessage += `📄 **Transaction Hash**: \`${truncateAddress(result.txHash)}\`\n`
        }
        
        if (data.action === 'send' || data.recipient) {
          successMessage += `💸 **Sent**: ${data.details?.amount || data.amount} ${data.details?.token || data.token}\n`
          successMessage += `📍 **To**: ${truncateAddress(data.details?.recipient || data.recipient)}\n`
        } else if (data.action === 'claim' || data.identifier) {
          successMessage += `📥 **Claimed**: Transfer from ${truncateAddress(data.details?.identifier || data.identifier)}\n`
        } else if (data.action === 'refund' || data.transferId) {
          successMessage += `🔄 **Refunded**: Transfer ${truncateAddress(data.details?.transferId || data.transferId)}\n`
        }

        updateMessage(messageId, {
          content: successMessage,
          status: 'sent',
          metadata: {
            txHash: result.txHash,
            transferId: result.transferId,
            action: data.action || 'transaction'
          }
        })
      } else {
        throw new Error(result?.error || 'Transaction failed')
      }
    } catch (error) {
      updateMessage(messageId, {
        content: `❌ **Transaction failed**: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
      })
    }

    setPendingConfirmation(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-green-500/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-500/20 bg-green-500/5">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-black" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse" />
          </div>
          <div>
            <h3 className="text-green-400 font-semibold">ProtectedPay AI</h3>
            <p className="text-xs text-gray-400">Smart contract assistant</p>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          {address ? (
            <span className="text-green-400">✓ Connected</span>
          ) : (
            <span className="text-yellow-400">⚠ Not connected</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 styled-scrollbar">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-end space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {message.type === 'user' ? (
                      <UserIcon className="w-5 h-5" />
                    ) : (
                      <CpuChipIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Message bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                      : 'bg-green-500/10 text-green-100 border border-green-500/20'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ 
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                          .replace(/• /g, '• ')
                      }} />
                    </div>
                    
                    {/* Status indicator */}
                    {message.status && (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-green-500/20">
                        {message.status === 'sending' && (
                          <>
                            <ArrowPathIcon className="w-4 h-4 animate-spin text-yellow-400" />
                            <span className="text-xs text-yellow-400">Processing...</span>
                          </>
                        )}
                        {message.status === 'sent' && (
                          <>
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400">Completed</span>
                          </>
                        )}
                        {message.status === 'error' && (
                          <>
                            <XCircleIcon className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400">Failed</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    {/* Action buttons for transaction results */}
                    {message.metadata?.txHash && (
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => copyToClipboard(message.metadata?.txHash || '')}
                          className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center space-x-1 hover:bg-green-500/30"
                        >
                          <ClipboardDocumentIcon className="w-3 h-3" />
                          <span>Copy TX</span>
                        </button>
                        {message.metadata?.transferId && (
                          <button
                            onClick={() => copyToClipboard(message.metadata?.transferId || '')}
                            className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded flex items-center space-x-1 hover:bg-blue-500/30"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                            <span>Copy ID</span>
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 rounded-2xl px-4 py-3">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {pendingConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-100 text-sm">{pendingConfirmation.message}</p>
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={() => handleConfirmation(true)}
                    className="bg-green-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-400 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleConfirmation(false)}
                    className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-green-500/20 bg-black/20">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !address 
                  ? "Connect your wallet to start chatting..." 
                  : "Ask me to send funds, check balance, or anything else..."
              }
              disabled={!address || isLoading}
              className="w-full bg-black/50 border border-green-500/30 text-green-100 placeholder-gray-500 rounded-xl px-4 py-3 pr-20 focus:outline-none focus:border-green-500/50 disabled:opacity-50"
            />
            {speechSupported && (
              <button
                onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                disabled={!address || isLoading}
                className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isListening 
                    ? 'text-red-400 bg-red-400/20 hover:text-red-300' 
                    : 'text-gray-400 hover:text-green-400 hover:bg-green-400/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                <MicrophoneIcon className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
            )}
            {input && (
              <button
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <motion.button
            onClick={handleSendMessage}
            disabled={!input.trim() || !address || isLoading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-black p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        
        {!address && (
          <div className="flex items-center space-x-2 mt-2 text-xs text-yellow-400">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Connect your wallet to use AI features</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIChatInterface
