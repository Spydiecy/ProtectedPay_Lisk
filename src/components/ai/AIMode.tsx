'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import AIChatInterface from './AIChatInterface'
import ChainSelector from '../ChainSelector'

interface AIModeProps {
  isOpen: boolean
  onToggle: () => void
}

const AIMode: React.FC<AIModeProps> = ({ isOpen, onToggle }) => {
  return (
    <>
      {/* AI Mode Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-xl border transition-all duration-300 ${
          isOpen
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-green-500/20 border-green-500/30 text-green-400'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isOpen ? 'Close AI Mode' : 'Open AI Assistant'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <XMarkIcon className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="ai"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="relative"
            >
              <SparklesIcon className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* AI Mode Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-4 md:inset-8 flex flex-col"
            >
              {/* AI Mode Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-3 border border-green-500/20">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <CpuChipIcon className="w-5 h-5 text-black" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-black animate-pulse" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                        AI Assistant Mode
                      </h1>
                      <p className="text-sm text-gray-400">Smart contract operations via conversation</p>
                    </div>
                  </div>
                  
                  {/* Chain Selector */}
                  <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-green-500/20 p-1">
                    <ChainSelector />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-green-500/20 px-4 py-2">
                    <div className="flex items-center space-x-2 text-sm text-green-400">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Natural language commands</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Chat Interface */}
              <div className="flex-1 min-h-0">
                <AIChatInterface />
              </div>

              {/* Footer with tips */}
              <div className="mt-4 bg-black/30 backdrop-blur-xl rounded-xl border border-green-500/20 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>**Send**: "Send 10 FLOW to 0x1234..."</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>**Claim**: "Claim from alice"</span>
                  </div>
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>**Balance**: "What's my balance?"</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIMode
