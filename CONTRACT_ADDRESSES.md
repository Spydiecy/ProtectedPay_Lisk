# ProtectedPay Contract Addresses

This document contains the deployed contract addresses for ProtectedPay across different networks.

## Flow EVM Testnet (Chain ID: 545)

### Main Contract (ProtectedPay Core)
```
Address: 0xa1eF679Ab1a6C41B4Ec7d9aB8Fc3293CE02592FA
```

### Token Contract 
```
Address: 0x16f16b1742ECA434faf9442a9f9d933A766acfCA
```

**Supported Tokens:**
- FLOW (Native)
- USDC
- USDT

---

## Filecoin Calibration Testnet (Chain ID: 314159)

### Main Contract (ProtectedPay Core)
```
Address: 0x74689f77e03D8213DF5037b681F05b80bAAe3504
```

### Token Contract
```
Address: 0x151D3c8E531d9726148FF64D5e8426C03D0e91eF
```

**Supported Tokens:**
- tFIL (Native)
- tUSDFC

---

## Configuration

These addresses are configured in:

1. **`src/utils/contract.ts`** - Hard-coded contract addresses
2. **`.env`** - Environment variables (for reference)
3. **`.env.example`** - Example environment file

## Usage

The contracts are automatically selected based on the connected network:
- When connected to Flow EVM Testnet (545), Flow contracts are used
- When connected to Filecoin Calibration (314159), Filecoin contracts are used

## Network Details

### Flow EVM Testnet
- **Chain ID:** 545
- **RPC URL:** https://testnet.evm.nodes.onflow.org
- **Explorer:** https://evm-testnet.flowscan.io

### Filecoin Calibration Testnet  
- **Chain ID:** 314159
- **RPC URL:** https://calibration.filfox.info/rpc/v1
- **Explorer:** https://calibration.filfox.info

---

*Last Updated: July 7, 2025*
