# ProtectedPay AI Integration Guide

This guide explains how to use the built-in AI chat interface powered by Google Gemini in the ProtectedPay dashboard.

## 🤖 AI Chat Interface (Built-in)

The ProtectedPay dashboard includes a built-in AI assistant powered by Google Gemini 2.5 Flash that provides natural language access to all smart contract functions.

### Features
- 💬 **Natural Language Processing**: Understands commands like "Send 10 FLOW to alice"
- 🔄 **Real-time Interaction**: Instant responses and transaction confirmations
- 🎯 **Context Awareness**: Knows your current chain, balance, and pending transfers
- 🛡️ **Transaction Safety**: Always asks for confirmation before executing transactions
- 📱 **Mobile Friendly**: Responsive design works on all devices

### Usage Examples

#### Sending Transfers
```
User: "Send 25 FLOW to 0x1234567890123456789012345678901234567890"
AI: I'll help you send 25 FLOW to that address
AI: Please confirm: Send 25 FLOW to 0x1234...?
User: "Confirm"
AI: ✅ Transaction successful! Transfer ID: 0xabc123...
```

#### Checking Balances
```
User: "What's my USDC balance?"
AI: 💰 Your Balance
    • USDC: 1,250.50
    • Address: 0x1234...
    • Chain: Flow EVM Testnet
```

#### Claiming Transfers
```
User: "Claim transfer from alice"
AI: I'll help you claim the transfer from alice
AI: Confirm claiming transfer from alice?
User: "Yes"
AI: ✅ Transfer claimed successfully! Amount: 100 USDC
```

#### Managing Transfers
```
User: "Show my pending transfers"
AI: 📋 Your Pending Transfers
    📥 To Claim (2):
    1. 25.5 FLOW from 0xabcd...
    2. 100 USDC from alice
    
    📤 Can Refund (1):
    1. 50 FLOW to bob
```

#### Registering Username
```
User: "Register spy as my username"
AI: I understand you want to register "spy" as your username for 
    your wallet address 0x1234...A2d8 on Filecoin Calibration Testnet.
    
    Before I proceed, could you please confirm that you want to 
    register the username "spy"? This action is irreversible.
    
    Please type "yes" to confirm.
User: "yes"
AI: ✅ Username "spy" registered successfully!
    👤 Your wallet address is now linked to username "spy". 
    Others can send transfers to you using this username.
```

### Activating AI Mode

1. **Open Dashboard**: Navigate to your ProtectedPay dashboard
2. **Click AI Button**: Look for the sparkles (✨) icon in the top-right corner
3. **Start Chatting**: The AI assistant will greet you and show available commands
4. **Chain Selection**: Use the chain selector at the top to switch networks

## 🎯 Advanced Features

### Multi-Chain Support
The AI automatically detects and works with multiple chains:
- **Flow EVM Testnet** (545): FLOW, USDC, USDT
- **Filecoin Calibration** (314159): tFIL, tUSDFC

### Smart Context Awareness
The AI remembers:
- Your current connected wallet
- Selected blockchain network
- Recent transaction history
- Available token balances
- Pending transfers

### Natural Language Processing
Understands various command formats:
- "Send 10 FLOW to alice"
- "Transfer 100 USDC to 0x1234..."
- "Check my balance"
- "What's my FLOW balance?"
- "Claim from bob"
- "Refund transaction 0x1234..."
- "Show pending transfers"
- "Register username alice"

### Transaction Safety
- ✅ Always confirms before executing transactions
- 🔍 Shows transaction details before confirmation
- ⚡ Provides transaction hashes and transfer IDs
- 🛡️ Uses escrow protection for all transfers
- 🔄 Allows refunds for unclaimed transfers

## 🚀 Getting Started

### Quick Start (Built-in AI)
1. Open ProtectedPay dashboard
2. Connect your wallet
3. Click the AI assistant button (✨)
4. Start chatting with natural language commands

### Example Session
```
User: "Hey AI, what can you help me with?"

AI: 👋 Welcome to ProtectedPay AI Assistant!

I can help you with:
• 💸 Send protected transfers - "Send 10 FLOW to 0x1234..."
• 📥 Claim transfers - "Claim transfer from Alice"
• 🔄 Refund transfers - "Refund transfer ID 0xabc..."
• 💰 Check balances - "What's my USDC balance?"
• 📋 View transfers - "Show my pending transfers"
• ⛓️ Chain info - "What tokens are supported on Flow?"

User: "What's my current balance?"

AI: 💰 Your Balance
• FLOW: 45.25
• USDC: 1,200.00
• USDT: 500.00
• Address: 0x1234...5678
• Chain: Flow EVM Testnet

User: "Send 20 FLOW to alice"

AI: I'll help you send 20 FLOW to alice
Please confirm: Send 20 FLOW to alice?

User: "Confirm"

AI: ⏳ Processing transaction... Please confirm in your wallet.

AI: ✅ Transaction Successful!
🧾 Transaction Hash: 0xabc123...
🆔 Transfer ID: 0xdef456...
📤 Sent to: alice
💰 Amount: 20 FLOW

💡 Next Steps: Share the Transfer ID with alice so they can claim their funds!
```

## 🔧 Troubleshooting

### Common Issues

**AI not responding**
- Check wallet connection
- Ensure you're on a supported chain
- Refresh the page and try again

**Transaction failures**
- Verify sufficient balance
- Check network connectivity
- Ensure correct recipient address

### Support

For additional help:
1. Check the console for error messages
2. Review transaction on block explorer
3. Consult the README.md file
4. Contact the ProtectedPay team

## 🌟 Pro Tips

1. **Use Clear Commands**: Be specific with amounts and recipients
2. **Double-Check Addresses**: Always verify recipient addresses
3. **Save Transfer IDs**: Keep transfer IDs to share with recipients
4. **Monitor Balances**: Regular balance checks help track funds
5. **Network Awareness**: Remember which chain you're on
6. **Gas Considerations**: Ensure sufficient native tokens for gas

The AI assistant makes ProtectedPay incredibly easy to use while maintaining the security and protection features that make the protocol special!
