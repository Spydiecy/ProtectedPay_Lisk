'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  PlusIcon,
  MinusIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

interface TransactionCardProps {
  type: 'transfer' | 'group_payment' | 'savings_pot'
  direction?: 'sent' | 'received'
  amount: string
  token: string
  status: number
  timestamp?: number
  recipient?: string
  sender?: string
  name?: string
  participants?: number
  currentAmount?: string
  targetAmount?: string
  isCompleted?: boolean
  id?: string
  onAction?: (action: string, data: any) => void
}

interface TransactionCardsGridProps {
  transactions: TransactionCardProps[]
  showActions?: boolean
  onAction?: (action: string, data: any) => void
}

const getStatusIcon = (status: number) => {
  switch (status) {
    case 0: return <ClockIcon className="w-4 h-4 text-yellow-400" />
    case 1: return <ExclamationCircleIcon className="w-4 h-4 text-blue-400" />
    case 2: return <CheckCircleIcon className="w-4 h-4 text-green-400" />
    case 3: return <XCircleIcon className="w-4 h-4 text-red-400" />
    default: return <ClockIcon className="w-4 h-4 text-gray-400" />
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return 'Pending'
    case 1: return 'Processing'
    case 2: return 'Completed'
    case 3: return 'Refunded'
    default: return 'Unknown'
  }
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  direction,
  amount,
  token,
  status,
  timestamp,
  recipient,
  sender,
  name,
  participants,
  currentAmount,
  targetAmount,
  isCompleted,
  id,
  onAction
}) => {
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

  const getCardGradient = () => {
    switch (type) {
      case 'transfer':
        return direction === 'sent' 
          ? 'from-red-500/20 to-pink-500/20 border-red-500/30'
          : 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'group_payment':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      case 'savings_pot':
        return 'from-purple-500/20 to-violet-500/20 border-purple-500/30'
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'transfer':
        return direction === 'sent' 
          ? <ArrowUpIcon className="w-5 h-5 text-red-400" />
          : <ArrowDownIcon className="w-5 h-5 text-green-400" />
      case 'group_payment':
        return <UsersIcon className="w-5 h-5 text-blue-400" />
      case 'savings_pot':
        return <BanknotesIcon className="w-5 h-5 text-purple-400" />
      default:
        return <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const renderContent = () => {
    switch (type) {
      case 'transfer':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon()}
                <span className="font-medium text-gray-200">
                  {direction === 'sent' ? 'Sent to' : 'Received from'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(status)}
                <span className="text-xs text-gray-400">{getStatusText(status)}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              {truncateAddress(direction === 'sent' ? recipient : sender)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                {amount} {token}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(timestamp)}
              </span>
            </div>
          </div>
        )
      
      case 'group_payment':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon()}
                <span className="font-medium text-gray-200">Group Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <ClockIcon className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-xs text-gray-400">
                  {isCompleted ? 'Complete' : 'Active'}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              For: {truncateAddress(recipient)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                {amount} {token}
              </span>
              <span className="text-sm text-blue-400">
                {participants} people
              </span>
            </div>
            
            {onAction && !isCompleted && (
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => onAction('contribute_group_payment', { paymentId: id, amount: '10' })}
                  className="flex-1 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-1"
                >
                  <PlusIcon className="w-3 h-3" />
                  <span>Contribute</span>
                </button>
              </div>
            )}
          </div>
        )
      
      case 'savings_pot':
        const progress = targetAmount && currentAmount 
          ? Math.round((parseFloat(currentAmount) / parseFloat(targetAmount)) * 100)
          : 0
        
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon()}
                <span className="font-medium text-gray-200">Savings Pot</span>
              </div>
              <span className="text-xs text-purple-400">{progress}%</span>
            </div>
            
            <div className="text-sm font-medium text-gray-200">
              "{name}"
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">
                  {currentAmount || '0'}/{targetAmount || '0'} {token}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
            
            {onAction && (
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => onAction('contribute_savings_pot', { potId: id, amount: '10' })}
                  className="flex-1 bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors flex items-center justify-center space-x-1"
                >
                  <PlusIcon className="w-3 h-3" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => onAction('break_savings_pot', { potId: id })}
                  className="flex-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-1"
                >
                  <MinusIcon className="w-3 h-3" />
                  <span>Withdraw</span>
                </button>
              </div>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${getCardGradient()} backdrop-blur-sm rounded-xl p-4 border transition-all duration-200 hover:shadow-lg hover:shadow-black/20`}
    >
      {renderContent()}
    </motion.div>
  )
}

const TransactionCardsGrid: React.FC<TransactionCardsGridProps> = ({
  transactions,
  showActions = false,
  onAction
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No transactions found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {transactions.map((transaction, index) => (
        <TransactionCard
          key={`${transaction.type}-${index}`}
          {...transaction}
          onAction={showActions ? onAction : undefined}
        />
      ))}
    </div>
  )
}

export { TransactionCard, TransactionCardsGrid }
export type { TransactionCardProps, TransactionCardsGridProps }
