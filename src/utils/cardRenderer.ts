import { TransactionCardProps } from '@/components/ai/TransactionCards'

interface TransactionData {
  type?: string
  amount?: string | number
  token?: { symbol: string } | string
  status?: number
  timestamp?: number
  sender?: string
  recipient?: string
  name?: string
  numParticipants?: number
  currentAmount?: string | number
  targetAmount?: string | number
  isCompleted?: boolean
  id?: string
}

const formatAmount = (amount: string | number): string => {
  if (typeof amount === 'string') {
    const numAmount = parseFloat(amount)
    return numAmount > 0 ? (numAmount / 1e18).toFixed(4) : '0.0000'
  }
  return amount > 0 ? (amount / 1e18).toFixed(4) : '0.0000'
}

const getTokenSymbol = (token: { symbol: string } | string | undefined): string => {
  if (!token) return 'BDAG'
  return typeof token === 'string' ? token : token.symbol
}

export const generateTransactionCardsHTML = (
  transactions: TransactionData[],
  userAddress: string,
  showActions = false,
  title = 'Transactions'
): string => {
  if (transactions.length === 0) {
    return `
      <div style="
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 1rem;
        margin: 1rem 0;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">💳</div>
        <p style="color: #9CA3AF; margin: 0;">No ${title.toLowerCase()} found</p>
        <p style="color: #6B7280; font-size: 0.875rem; margin: 0.5rem 0 0 0;">
          Start by creating transactions, group payments, or savings pots!
        </p>
      </div>
    `
  }

  let html = `
    <div style="margin: 1rem 0;">
      <h3 style="
        color: #10B981;
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      ">
        📊 ${title} (${transactions.length})
      </h3>
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      ">
  `

  transactions.forEach((transaction, index) => {
    const cardHTML = generateSingleTransactionCardHTML(transaction, userAddress, showActions, index)
    html += cardHTML
  })

  html += `
      </div>
    </div>
  `

  return html
}

const generateSingleTransactionCardHTML = (
  transaction: TransactionData,
  userAddress: string,
  showActions: boolean,
  index: number
): string => {
  const type = transaction.type || 'transfer'
  const amount = formatAmount(transaction.amount || 0)
  const token = getTokenSymbol(transaction.token)
  const status = transaction.status || 0
  const timestamp = transaction.timestamp
  const isOutgoing = transaction.sender?.toLowerCase() === userAddress.toLowerCase()
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateAddress = (address?: string) => {
    if (!address) return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0: return { icon: '🟡', text: 'Pending', color: '#F59E0B' }
      case 1: return { icon: '🔵', text: 'Processing', color: '#3B82F6' }
      case 2: return { icon: '🟢', text: 'Completed', color: '#10B981' }
      case 3: return { icon: '🔴', text: 'Refunded', color: '#EF4444' }
      default: return { icon: '⚪', text: 'Unknown', color: '#6B7280' }
    }
  }

  const getCardStyle = () => {
    switch (type) {
      case 'transfer':
        return isOutgoing 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 127, 0.1))'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))'
      case 'group_payment':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1))'
      case 'savings_pot':
        return 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(124, 58, 237, 0.1))'
      default:
        return 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(75, 85, 99, 0.1))'
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'transfer':
        return isOutgoing ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
      case 'group_payment':
        return 'rgba(59, 130, 246, 0.3)'
      case 'savings_pot':
        return 'rgba(147, 51, 234, 0.3)'
      default:
        return 'rgba(107, 114, 128, 0.3)'
    }
  }

  const statusInfo = getStatusInfo(status)

  if (type === 'group_payment') {
    const participants = transaction.numParticipants || 0
    const isCompleted = transaction.isCompleted || false
    
    return `
      <div style="
        background: ${getCardStyle()};
        border: 1px solid ${getBorderColor()};
        border-radius: 1rem;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
        transition: all 0.2s ease;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">👥</span>
            <span style="color: #E5E7EB; font-weight: 500;">Group Payment</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <span>${isCompleted ? '🟢' : '🟡'}</span>
            <span style="color: #9CA3AF; font-size: 0.75rem;">
              ${isCompleted ? 'Complete' : 'Active'}
            </span>
          </div>
        </div>
        
        <div style="color: #D1D5DB; font-size: 0.875rem; margin-bottom: 1rem;">
          For: ${truncateAddress(transaction.recipient)}
        </div>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1rem;
        ">
          <span style="color: white; font-size: 1.125rem; font-weight: 700;">
            ${amount} ${token}
          </span>
          <span style="color: #60A5FA; font-size: 0.875rem;">
            ${participants} people
          </span>
        </div>
        
        ${showActions && !isCompleted ? `
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button style="
              flex: 1;
              background: rgba(59, 130, 246, 0.2);
              color: #60A5FA;
              border: none;
              padding: 0.5rem 0.75rem;
              border-radius: 0.5rem;
              font-size: 0.75rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.15s ease;
            ">
              💰 Contribute
            </button>
          </div>
        ` : ''}
      </div>
    `
  }

  if (type === 'savings_pot') {
    const currentAmount = formatAmount(transaction.currentAmount || 0)
    const targetAmount = formatAmount(transaction.targetAmount || 0)
    const progress = transaction.targetAmount && transaction.currentAmount 
      ? Math.round((parseFloat(currentAmount) / parseFloat(targetAmount)) * 100)
      : 0
    
    return `
      <div style="
        background: ${getCardStyle()};
        border: 1px solid ${getBorderColor()};
        border-radius: 1rem;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
        transition: all 0.2s ease;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">🏦</span>
            <span style="color: #E5E7EB; font-weight: 500;">Savings Pot</span>
          </div>
          <span style="color: #A78BFA; font-size: 0.75rem; font-weight: 600;">
            ${progress}%
          </span>
        </div>
        
        <div style="color: #E5E7EB; font-size: 0.875rem; font-weight: 500; margin-bottom: 1rem;">
          "${transaction.name}"
        </div>
        
        <div style="margin-bottom: 1rem;">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          ">
            <span style="color: #9CA3AF;">Progress</span>
            <span style="color: white;">
              ${currentAmount}/${targetAmount} ${token}
            </span>
          </div>
          
          <div style="
            width: 100%;
            background: #374151;
            border-radius: 9999px;
            height: 8px;
            overflow: hidden;
          ">
            <div style="
              background: linear-gradient(90deg, #8B5CF6, #7C3AED);
              height: 100%;
              width: ${Math.min(progress, 100)}%;
              border-radius: 9999px;
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>
        
        ${showActions ? `
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button style="
              flex: 1;
              background: rgba(147, 51, 234, 0.2);
              color: #A78BFA;
              border: none;
              padding: 0.5rem 0.75rem;
              border-radius: 0.5rem;
              font-size: 0.75rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.15s ease;
            ">
              💰 Deposit
            </button>
            <button style="
              flex: 1;
              background: rgba(239, 68, 68, 0.2);
              color: #F87171;
              border: none;
              padding: 0.5rem 0.75rem;
              border-radius: 0.5rem;
              font-size: 0.75rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.15s ease;
            ">
              💸 Withdraw
            </button>
          </div>
        ` : ''}
      </div>
    `
  }

  // Regular transfer card
  const direction = isOutgoing ? 'sent' : 'received'
  const directionIcon = isOutgoing ? '📤' : '📥'
  const directionText = isOutgoing ? 'Sent to' : 'Received from'
  const counterparty = isOutgoing ? transaction.recipient : transaction.sender

  return `
    <div style="
      background: ${getCardStyle()};
      border: 1px solid ${getBorderColor()};
      border-radius: 1rem;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      ">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.25rem;">${directionIcon}</span>
          <span style="color: #E5E7EB; font-weight: 500;">${directionText}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.25rem;">
          <span>${statusInfo.icon}</span>
          <span style="color: #9CA3AF; font-size: 0.75rem;">
            ${statusInfo.text}
          </span>
        </div>
      </div>
      
      <div style="color: #D1D5DB; font-size: 0.875rem; margin-bottom: 1rem;">
        ${truncateAddress(counterparty)}
      </div>
      
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      ">
        <span style="color: white; font-size: 1.125rem; font-weight: 700;">
          ${amount} ${token}
        </span>
        <span style="color: #9CA3AF; font-size: 0.75rem;">
          ${formatDate(timestamp)}
        </span>
      </div>
    </div>
  `
}

export const generateActionButtonsHTML = (
  type: 'group_payments' | 'savings_pots' | 'transfers',
  hasData: boolean
): string => {
  if (!hasData) {
    return `
      <div style="
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 1rem;
        padding: 1.5rem;
        margin: 1rem 0;
        text-align: center;
      ">
        <div style="font-size: 2rem; margin-bottom: 1rem;">✨</div>
        <p style="color: #10B981; font-weight: 600; margin-bottom: 0.5rem;">
          Get Started with ProtectedPay
        </p>
        <div style="color: #6B7280; font-size: 0.875rem; line-height: 1.4;">
          ${getStarterTips(type)}
        </div>
      </div>
    `
  }

  return `
    <div style="
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 1rem;
      padding: 1rem;
      margin: 1rem 0;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      ">
        <span style="font-size: 1rem;">⚡</span>
        <span style="color: #10B981; font-weight: 600; font-size: 0.875rem;">
          Quick Actions
        </span>
      </div>
      <div style="color: #9CA3AF; font-size: 0.75rem; line-height: 1.4;">
        ${getQuickActions(type)}
      </div>
    </div>
  `
}

const getStarterTips = (type: string): string => {
  switch (type) {
    case 'group_payments':
      return `
        • Say "Create group payment for Alice with 5 people for 100 BDAG"<br>
        • Or try "Make a group payment for dinner - 50 BDAG for 4 friends"<br>
        • Split costs easily and track contributions in real-time on BlockDAG Testnet
      `
    case 'savings_pots':
      return `
        • Say "Create savings pot 'Vacation' with target 1000 BDAG"<br>
        • Or try "Make a savings goal for new laptop - 500 BDAG"<br>
        • Set goals and track your progress automatically on BlockDAG Testnet
      `
    default:
      return `
        • Say "Send 10 BDAG to Alice" to start transferring<br>
        • Try "Show my balance" to check your funds<br>
        • Use "Show my pending transfers" to see what's incoming
      `
  }
}

const getQuickActions = (type: string): string => {
  switch (type) {
    case 'group_payments':
      return `
        • "Contribute to group payment [ID]" - Add funds to a payment<br>
        • "Create new group payment" - Start splitting a new expense<br>
        • "Show group payment details [ID]" - View specific payment info
      `
    case 'savings_pots':
      return `
        • "Deposit to savings pot [name]" - Add money to your goal<br>
        • "Withdraw from savings pot [name]" - Take money out<br>
        • "Create new savings pot" - Start a new savings goal
      `
    default:
      return `
        • "Show completed transactions" - View successful transfers<br>
        • "Show pending transactions" - See what's waiting<br>
        • "Show sent transfers" or "Show received transfers" - Filter by direction
      `
  }
}
