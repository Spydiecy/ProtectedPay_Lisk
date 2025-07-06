import { ethers } from 'ethers';

const CONTRACT_ADDRESSES = {
	747: process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', // Flow EVM Mainnet
	545: process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', // Flow EVM Testnet
	314159: process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', // Filecoin Calibration testnet
} as const;

const TOKEN_CONTRACT_ADDRESSES = {
	747: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', // Flow EVM Mainnet
	545: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', // Flow EVM Testnet
	314159: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', // Filecoin Calibration testnet
} as const;

const TOKEN_CONTRACT_ABI =  [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "addSupportedToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_transferId",
				"type": "bytes32"
			}
		],
		"name": "claimTokenTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_senderAddress",
				"type": "address"
			}
		],
		"name": "claimTokenTransferByAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_senderUsername",
				"type": "string"
			}
		],
		"name": "claimTokenTransferByUsername",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_baseContract",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "removeSupportedToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_transferId",
				"type": "bytes32"
			}
		],
		"name": "refundTokenTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_remarks",
				"type": "string"
			}
		],
		"name": "sendTokenToAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_remarks",
				"type": "string"
			}
		],
		"name": "sendTokenToUsername",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "TokenAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "TokenRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "transferId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TokenTransferClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "transferId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"name": "TokenTransferInitiated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "transferId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TokenTransferRefunded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "baseContract",
		"outputs": [
			{
				"internalType": "contract ProtectedPay",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "canTransferToken",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_sender",
				"type": "address"
			}
		],
		"name": "getPendingTokenTransfers",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getRootTokenAllowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getRootTokenBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_transferId",
				"type": "bytes32"
			}
		],
		"name": "getTokenTransferDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum ProtectedPayTokens.TokenTransferStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isNativeToken",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "getUserByAddress",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			}
		],
		"name": "getUserByUsername",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserTokenTransferIds",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserTokenTransfers",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "recipient",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum ProtectedPayTokens.TokenTransferStatus",
						"name": "status",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "remarks",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isNativeToken",
						"type": "bool"
					}
				],
				"internalType": "struct ProtectedPayTokens.TokenTransfer[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pendingTokenTransfersBySender",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ROOT_TOKEN",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "supportedTokens",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tokenTransferIdsByUser",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "tokenTransfers",
		"outputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum ProtectedPayTokens.TokenTransferStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isNativeToken",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_potId",
				"type": "bytes32"
			}
		],
		"name": "breakPot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_senderAddress",
				"type": "address"
			}
		],
		"name": "claimTransferByAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_transferId",
				"type": "bytes32"
			}
		],
		"name": "claimTransferById",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_senderUsername",
				"type": "string"
			}
		],
		"name": "claimTransferByUsername",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_paymentId",
				"type": "bytes32"
			}
		],
		"name": "contributeToGroupPayment",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_potId",
				"type": "bytes32"
			}
		],
		"name": "contributeToSavingsPot",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_numParticipants",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_remarks",
				"type": "string"
			}
		],
		"name": "createGroupPayment",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_targetAmount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_remarks",
				"type": "string"
			}
		],
		"name": "createSavingsPot",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "paymentId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "GroupPaymentCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "paymentId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "contributor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "GroupPaymentContributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "paymentId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "numParticipants",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"name": "GroupPaymentCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "potId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "PotBroken",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "potId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "contributor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "PotContribution",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_transferId",
				"type": "bytes32"
			}
		],
		"name": "refundTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			}
		],
		"name": "registerUsername",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "potId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "targetAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"name": "SavingsPotCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_remarks",
				"type": "string"
			}
		],
		"name": "sendToAddress",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_remarks",
				"type": "string"
			}
		],
		"name": "sendToUsername",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "transferId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TransferClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "transferId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"name": "TransferInitiated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "transferId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TransferRefunded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "UserRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_paymentId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getGroupPaymentContribution",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_paymentId",
				"type": "bytes32"
			}
		],
		"name": "getGroupPaymentDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountPerPerson",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "numParticipants",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountCollected",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum ProtectedPay.GroupPaymentStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_sender",
				"type": "address"
			}
		],
		"name": "getPendingTransfers",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_potId",
				"type": "bytes32"
			}
		],
		"name": "getSavingsPotDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "targetAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum ProtectedPay.PotStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_transferId",
				"type": "bytes32"
			}
		],
		"name": "getTransferDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum ProtectedPay.TransferStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "getUserByAddress",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			}
		],
		"name": "getUserByUsername",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "getUserProfile",
		"outputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "bytes32[]",
				"name": "transferIds",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "groupPaymentIds",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "participatedGroupPayments",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "savingsPotIds",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "getUserTransfers",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "recipient",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum ProtectedPay.TransferStatus",
						"name": "status",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "remarks",
						"type": "string"
					}
				],
				"internalType": "struct ProtectedPay.Transfer[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pendingTransfersBySender",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ROOT_TOKEN",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "supportedTokens",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tokenTransferIdsByUser",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "transfers",
		"outputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum ProtectedPay.TransferStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "remarks",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "usernameToAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Types for all events and returns
interface TransferEvent {
	type: 'TransferInitiated' | 'TransferClaimed' | 'TransferRefunded';
	transferId: string;
	sender?: string;
	recipient?: string;
	amount: string;
	remarks?: string;
	event: ethers.Event;
  }
  
  interface GroupPaymentEvent {
	type: 'GroupPaymentCreated' | 'GroupPaymentContributed' | 'GroupPaymentCompleted';
	paymentId: string;
	creator?: string;
	recipient?: string;
	amount: string;
	numParticipants?: number;
	remarks?: string;
	event: ethers.Event;
  }
  
  interface SavingsPotEvent {
	type: 'SavingsPotCreated' | 'PotContribution' | 'PotBroken';
	potId: string;
	owner?: string;
	amount?: string;
	name?: string;
	targetAmount?: string;
	remarks?: string;
	event: ethers.Event;
  }
  
  interface UserProfile {
	username: string;
	transferIds: string[];
	groupPaymentIds: string[];
	participatedGroupPayments: string[];
	savingsPotIds: string[];
  }
  
  interface RawContractTransfer {
	sender: string;
	recipient: string;
	amount: ethers.BigNumber;
	timestamp: ethers.BigNumber;
	status: number;
	remarks: string;
  }
  
  export interface Transfer {
	sender: string;
	recipient: string;
	amount: string;
	timestamp: number;
	status: number;
	remarks: string;
  }
  
  export interface GroupPayment {
	id: string;
	paymentId: string;
	creator: string;
	recipient: string;
	totalAmount: string;
	amountPerPerson: string;
	numParticipants: number;
	amountCollected: string;
	timestamp: number;
	status: number;
	remarks: string;
  }
  
  export interface SavingsPot {
	id: string;
	potId: string;
	owner: string;
	name: string;
	targetAmount: string;
	currentAmount: string;
	timestamp: number;
	status: number;
	remarks: string;
  }
  
  // Gets the appropriate contract address based on chainId
  const getContractAddress = async (signer: ethers.Signer) => {
	const chainId = await signer.getChainId();
	return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] 
	  || CONTRACT_ADDRESSES[747]; // Default to Flow EVM Mainnet if chain not found
  };
  
  // Contract instance getter with chain awareness
  export const getContract = async (signer: ethers.Signer) => {
	const address = await getContractAddress(signer);
	return new ethers.Contract(address, CONTRACT_ABI, signer);
  };
  
  // Basic Contract Interaction Functions
  export const getPaymentAmount = async (signer: ethers.Signer, paymentId: string) => {
	try {
	  const contract = await getContract(signer);
	  const payment = await contract.getGroupPaymentDetails(paymentId);
	  return ethers.utils.formatEther(payment.amountPerPerson);
	} catch (error) {
	  console.error('Error fetching payment amount:', error);
	  throw error;
	}
  };
  
  // User Registration and Management
  export const registerUsername = async (signer: ethers.Signer, username: string) => {
	const contract = await getContract(signer);
	const tx = await contract.registerUsername(username);
	await tx.wait();
  };
  
  export const getUserByUsername = async (signer: ethers.Signer, username: string) => {
	const contract = await getContract(signer);
	return await contract.getUserByUsername(username);
  };
  
  export const getUserByAddress = async (signer: ethers.Signer, address: string) => {
	const contract = await getContract(signer);
	return await contract.getUserByAddress(address);
  };
  
  export const getUserProfile = async (signer: ethers.Signer, userAddress: string): Promise<UserProfile> => {
	const contract = await getContract(signer);
	return await contract.getUserProfile(userAddress);
  };
  
  // Transfer Functions
  export const sendToAddress = async (signer: ethers.Signer, recipient: string, amount: string, remarks: string) => {
	const contract = await getContract(signer);
	const tx = await contract.sendToAddress(recipient, remarks, { value: ethers.utils.parseEther(amount) });
	await tx.wait();
  };
  
  export const sendToUsername = async (signer: ethers.Signer, username: string, amount: string, remarks: string) => {
	const contract = await getContract(signer);
	const tx = await contract.sendToUsername(username, remarks, { value: ethers.utils.parseEther(amount) });
	await tx.wait();
  };
  
  export const claimTransferByAddress = async (signer: ethers.Signer, senderAddress: string) => {
	const contract = await getContract(signer);
	const tx = await contract.claimTransferByAddress(senderAddress);
	await tx.wait();
  };
  
  export const claimTransferByUsername = async (signer: ethers.Signer, senderUsername: string) => {
	const contract = await getContract(signer);
	const tx = await contract.claimTransferByUsername(senderUsername);
	await tx.wait();
  };
  
  export const claimTransferById = async (signer: ethers.Signer, transferId: string) => {
	const contract = await getContract(signer);
	const tx = await contract.claimTransferById(transferId);
	await tx.wait();
  };
  
  export const refundTransfer = async (signer: ethers.Signer, transferId: string) => {
	const contract = await getContract(signer);
	const tx = await contract.refundTransfer(transferId);
	await tx.wait();
  };
  
  // Group Payment Functions
  export const createGroupPayment = async (
	signer: ethers.Signer,
	recipient: string,
	numParticipants: number,
	amount: string,
	remarks: string
  ) => {
	const contract = await getContract(signer);
	const tx = await contract.createGroupPayment(
	  recipient,
	  numParticipants,
	  remarks,
	  { value: ethers.utils.parseEther(amount) }
	);
	await tx.wait();
  };
  
  export const contributeToGroupPayment = async (
	signer: ethers.Signer,
	paymentId: string,
	amount: string
  ) => {
	const contract = await getContract(signer);
	const tx = await contract.contributeToGroupPayment(paymentId, {
	  value: ethers.utils.parseEther(amount)
	});
	await tx.wait();
  };
  
  export const getGroupPaymentDetails = async (signer: ethers.Signer, paymentId: string) => {
	const contract = await getContract(signer);
	const details = await contract.getGroupPaymentDetails(paymentId);
	return {
	  id: paymentId,
	  paymentId,
	  creator: details.creator,
	  recipient: details.recipient,
	  totalAmount: ethers.utils.formatEther(details.totalAmount),
	  amountPerPerson: ethers.utils.formatEther(details.amountPerPerson),
	  numParticipants: details.numParticipants.toNumber(),
	  amountCollected: ethers.utils.formatEther(details.amountCollected),
	  timestamp: details.timestamp.toNumber(),
	  status: details.status,
	  remarks: details.remarks
	};
  };
  
  export const hasContributedToGroupPayment = async (
	signer: ethers.Signer,
	paymentId: string,
	userAddress: string
  ) => {
	const contract = await getContract(signer);
	const contribution = await contract.getGroupPaymentContribution(paymentId, userAddress);
	// If contribution is greater than 0, user has contributed
	return contribution.gt(0);
  };
  
  export const getGroupPaymentContribution = async (
	signer: ethers.Signer,
	paymentId: string,
	userAddress: string
  ) => {
	const contract = await getContract(signer);
	const contribution = await contract.getGroupPaymentContribution(paymentId, userAddress);
	return ethers.utils.formatEther(contribution);
  };
  
  // Savings Pot Functions
  export const createSavingsPot = async (
	signer: ethers.Signer,
	name: string,
	targetAmount: string,
	remarks: string
  ) => {
	const contract = await getContract(signer);
	const tx = await contract.createSavingsPot(
	  name,
	  ethers.utils.parseEther(targetAmount),
	  remarks
	);
	await tx.wait();
  };
  
  export const contributeToSavingsPot = async (
	signer: ethers.Signer,
	potId: string,
	amount: string
  ) => {
	const contract = await getContract(signer);
	const tx = await contract.contributeToSavingsPot(potId, {
	  value: ethers.utils.parseEther(amount)
	});
	await tx.wait();
  };
  
  export const breakPot = async (signer: ethers.Signer, potId: string) => {
	const contract = await getContract(signer);
	const tx = await contract.breakPot(potId);
	await tx.wait();
  };
  
  export const getSavingsPotDetails = async (signer: ethers.Signer, potId: string) => {
	const contract = await getContract(signer);
	const details = await contract.getSavingsPotDetails(potId);
	return {
	  id: potId,
	  potId,
	  owner: details.owner,
	  name: details.name,
	  targetAmount: ethers.utils.formatEther(details.targetAmount),
	  currentAmount: ethers.utils.formatEther(details.currentAmount),
	  timestamp: details.timestamp.toNumber(),
	  status: details.status,
	  remarks: details.remarks
	};
  };
  
  // Transaction History Functions
  export const getUserTransfers = async (
	signer: ethers.Signer,
	userAddress: string
  ): Promise<Transfer[]> => {
	const contract = await getContract(signer);
	const transfers: RawContractTransfer[] = await contract.getUserTransfers(userAddress);
  
	return transfers.map((transfer: RawContractTransfer) => ({
	  sender: transfer.sender,
	  recipient: transfer.recipient,
	  amount: ethers.utils.formatEther(transfer.amount),
	  timestamp: transfer.timestamp.toNumber(),
	  status: transfer.status,
	  remarks: transfer.remarks,
	}));
  };
  
  export const getTransferDetails = async (signer: ethers.Signer, transferId: string) => {
	const contract = await getContract(signer);
	const transfer = await contract.getTransferDetails(transferId);
	return {
	  sender: transfer.sender,
	  recipient: transfer.recipient,
	  amount: ethers.utils.formatEther(transfer.amount),
	  timestamp: transfer.timestamp.toNumber(),
	  status: transfer.status,
	  remarks: transfer.remarks
	};
  };
  
  export const getPendingTransfers = async (signer: ethers.Signer, userAddress: string) => {
	const contract = await getContract(signer);
	return await contract.getPendingTransfers(userAddress);
  };
  
  // Event Listeners
  export const listenForAllEvents = async (
	signer: ethers.Signer,
	callback: (event: TransferEvent | GroupPaymentEvent | SavingsPotEvent) => void
  ) => {
	const contract = await getContract(signer);
  
	// Transfer Events
	contract.on('TransferInitiated', 
	  (transferId, sender, recipient, amount, remarks, event) => {
		callback({
		  type: 'TransferInitiated',
		  transferId,
		  sender,
		  recipient,
		  amount: ethers.utils.formatEther(amount),
		  remarks,
		  event
		});
	  }
	);
  
	contract.on('TransferClaimed',
	  (transferId, recipient, amount, event) => {
		callback({
		  type: 'TransferClaimed',
		  transferId,
		  recipient,
		  amount: ethers.utils.formatEther(amount),
		  event
		});
	  }
	);
  
	contract.on('TransferRefunded',
	  (transferId, sender, amount, event) => {
		callback({
		  type: 'TransferRefunded',
		  transferId,
		  sender,
		  amount: ethers.utils.formatEther(amount),
		  event
		});
	  }
	);
  
	// Group Payment Events
	contract.on('GroupPaymentCreated', 
	  (paymentId, creator, recipient, totalAmount, numParticipants, remarks, event) => {
		callback({
		  type: 'GroupPaymentCreated',
		  paymentId,
		  creator,
		  recipient,
		  amount: ethers.utils.formatEther(totalAmount),
		  numParticipants,
		  remarks,
		  event
		});
	  }
	);
  
	contract.on('GroupPaymentContributed',
	  (paymentId, contributor, amount, event) => {
		callback({
		  type: 'GroupPaymentContributed',
		  paymentId,
		  creator: contributor,
		  amount: ethers.utils.formatEther(amount),
		  event
		});
	  }
	);
  
	contract.on('GroupPaymentCompleted',
	  (paymentId, recipient, amount, event) => {
		callback({
		  type: 'GroupPaymentCompleted',
		  paymentId,
		  recipient,
		  amount: ethers.utils.formatEther(amount),
		  event
		});
	  }
	);
  
	// Savings Pot Events
	contract.on('SavingsPotCreated', 
	  (potId, owner, name, targetAmount, remarks, event) => {
		callback({
		  type: 'SavingsPotCreated',
		  potId,
		  owner,
		  name,
		  targetAmount: ethers.utils.formatEther(targetAmount),
		  remarks,
		  event
		});
	  }
	);
  
	contract.on('PotContribution',
	  (potId, contributor, amount, event) => {
		callback({
		  type: 'PotContribution',
		  potId,
		  owner: contributor,
		  amount: ethers.utils.formatEther(amount),
		  event
		});
	  }
	);
  
	contract.on('PotBroken',
	  (potId, owner, amount, event) => {
		callback({
		  type: 'PotBroken',
		  potId,
		  owner,
		  amount: ethers.utils.formatEther(amount),
		  event
		});
	  }
	);
  
	return () => {
	  contract.removeAllListeners();
	};
  };
  
  // Helper Functions
  export const formatAmount = (amount: ethers.BigNumber): string => {
	return ethers.utils.formatEther(amount);
  };
  
  export const parseAmount = (amount: string): ethers.BigNumber => {
	return ethers.utils.parseEther(amount);
  };
  
  export const formatTimestamp = (timestamp: ethers.BigNumber): Date => {
	return new Date(timestamp.toNumber() * 1000);
  };
  
  // Chain specific helpers
  export const getCurrentChainId = async (signer: ethers.Signer): Promise<number> => {
	return await signer.getChainId();
  };
  
  export const getChainNativeCurrency = (chainId: number) => {
	switch (chainId) {
	  case 42069:
		return {
		  name: 'ETH',
		  symbol: 'ETH',
		  decimals: 18
		};
	  default:
		return {
		  name: 'ETH',
		  symbol: 'ETH',
		  decimals: 18
		};
	}
  };
  
  export const getExplorerUrl = (chainId: number) => {
	switch (chainId) {
	  case 42069:
		return 'https://devnet.explorer.moved.network';
	  default:
		return 'https://devnet.explorer.moved.network';
	}
  };
  
  export const isContractDeployed = async (signer: ethers.Signer): Promise<boolean> => {
	try {
	  const address = await getContractAddress(signer);
	  const provider = signer.provider;
	  if (!provider) return false;
	  
	  const code = await provider.getCode(address);
	  return code !== '0x';
	} catch (error) {
	  console.error('Error checking contract deployment:', error);
	  return false;
	}
  };
  
  // Error handling helper
  export class ContractError extends Error {
	constructor(
	  message: string,
	  public readonly code?: string,
	  public readonly chainId?: number
	) {
	  super(message);
	  this.name = 'ContractError';
	}
  }
  
  export const handleContractError = (error: unknown, chainId?: number): string => {
	if (error instanceof ContractError) {
	  return `Chain ${chainId}: ${error.message}`;
	}
	
	if (error instanceof Error) {
	  if (error.message.includes('user rejected')) {
		return 'Transaction was rejected by user';
	  }
	  if (error.message.includes('insufficient funds')) {
		return `Insufficient ${getChainNativeCurrency(chainId || 12227332).symbol} for transaction`;
	  }
	  return error.message;
	}
	
	return 'An unexpected error occurred';
  };

// Token Contract Functions
const getTokenContractAddress = async (signer: ethers.Signer) => {
  const chainId = await signer.getChainId();
  return TOKEN_CONTRACT_ADDRESSES[chainId as keyof typeof TOKEN_CONTRACT_ADDRESSES] 
    || TOKEN_CONTRACT_ADDRESSES[747]; // Default to Flow EVM Mainnet if chain not found
};

// Token contract instance getter with chain awareness
export const getTokenContract = async (signer: ethers.Signer) => {
  const address = await getTokenContractAddress(signer);
  return new ethers.Contract(address, TOKEN_CONTRACT_ABI, signer);
};

// Helper function to parse token amount with correct decimals
const parseTokenAmount = (amount: string, tokenAddress: string): ethers.BigNumber => {
  // Check if it's a specific token (removed ROOT token specific logic for Flow network)
  // if (tokenAddress.toLowerCase() === 'SPECIFIC_TOKEN_ADDRESS'.toLowerCase()) {
  //   return ethers.utils.parseUnits(amount, 6);
  // }
  // For most tokens, use 18 decimals (this may need adjustment based on actual token decimals)
  return ethers.utils.parseEther(amount);
};

// ERC20 Token Transfer Functions
export const sendTokenToAddress = async (
  signer: ethers.Signer, 
  recipient: string, 
  tokenAddress: string, 
  amount: string, 
  remarks: string
) => {
  const contract = await getTokenContract(signer);
  const tx = await contract.sendTokenToAddress(
    recipient, 
    tokenAddress, 
    parseTokenAmount(amount, tokenAddress), 
    remarks
  );
  await tx.wait();
};

export const sendTokenToUsername = async (
  signer: ethers.Signer, 
  username: string, 
  tokenAddress: string, 
  amount: string, 
  remarks: string
) => {
  const contract = await getTokenContract(signer);
  const tx = await contract.sendTokenToUsername(
    username, 
    tokenAddress, 
    parseTokenAmount(amount, tokenAddress), 
    remarks
  );
  await tx.wait();
};

export const claimTokenTransfer = async (signer: ethers.Signer, transferId: string) => {
  const contract = await getTokenContract(signer);
  const tx = await contract.claimTokenTransfer(transferId);
  await tx.wait();
};

export const claimTokenTransferByAddress = async (signer: ethers.Signer, senderAddress: string) => {
  const contract = await getTokenContract(signer);
  const tx = await contract.claimTokenTransferByAddress(senderAddress);
  await tx.wait();
};

export const claimTokenTransferByUsername = async (signer: ethers.Signer, senderUsername: string) => {
  const contract = await getTokenContract(signer);
  const tx = await contract.claimTokenTransferByUsername(senderUsername);
  await tx.wait();
};

export const refundTokenTransfer = async (signer: ethers.Signer, transferId: string) => {
  const contract = await getTokenContract(signer);
  const tx = await contract.refundTokenTransfer(transferId);
  await tx.wait();
};

export const getPendingTokenTransfers = async (signer: ethers.Signer, userAddress: string) => {
  const contract = await getTokenContract(signer);
  return await contract.getPendingTokenTransfers(userAddress);
};

// Helper function to format token amount with correct decimals
const formatTokenAmount = (amount: ethers.BigNumber, tokenAddress: string): string => {
  // Check if it's a specific token (removed ROOT token specific logic for Flow network)
  // if (tokenAddress.toLowerCase() === 'SPECIFIC_TOKEN_ADDRESS'.toLowerCase()) {
  //   return ethers.utils.formatUnits(amount, 6);
  // }
  // For most tokens, use 18 decimals (this may need adjustment based on actual token decimals)
  return ethers.utils.formatEther(amount);
};

export const getTokenTransferDetails = async (signer: ethers.Signer, transferId: string) => {
  const contract = await getTokenContract(signer);
  const details = await contract.getTokenTransferDetails(transferId);
  return {
    sender: details.sender,
    recipient: details.recipient,
    token: details.token,
    amount: formatTokenAmount(details.amount, details.token),
    timestamp: details.timestamp.toNumber(),
    status: details.status,
    remarks: details.remarks,
    isNativeToken: details.isNativeToken
  };
};

// Token balance and allowance functions
export const getTokenBalance = async (signer: ethers.Signer, tokenAddress: string, userAddress: string) => {
  console.log(`getTokenBalance called for token: ${tokenAddress}, user: ${userAddress}`);
  
  // For native token, get ETH balance
  if (tokenAddress === 'NATIVE') {
    const balance = await signer.provider?.getBalance(userAddress);
    const formattedBalance = balance ? ethers.utils.formatEther(balance) : '0';
    console.log(`Native token balance: ${formattedBalance}`);
    return formattedBalance;
  }
  
  // For ERC20 tokens, use the contract's balance function
  const contract = await getTokenContract(signer);
  
  // Check if it's a specific token (removed ROOT token specific logic for Flow network)
  // if (tokenAddress.toLowerCase() === 'SPECIFIC_TOKEN_ADDRESS'.toLowerCase()) {
  //   try {
  //     console.log('Fetching specific token balance...');
  //     const balance = await contract.getSpecificTokenBalance(userAddress);
  //     const formattedBalance = ethers.utils.formatUnits(balance, 6);
  //     console.log(`Specific token balance from contract: ${formattedBalance}`);
  //     return formattedBalance;
  //   } catch (error) {
  //     console.error('Error fetching specific token balance:', error);
  //     console.log('Falling back to standard ERC20 balanceOf...');
  //   }
  // }
  
  // For other ERC20 tokens, use standard ERC20 interface
  try {
    const erc20Contract = new ethers.Contract(tokenAddress, [
      'function balanceOf(address) view returns (uint256)'
    ], signer);
    const balance = await erc20Contract.balanceOf(userAddress);
    const formattedBalance = ethers.utils.formatEther(balance);
    console.log(`ERC20 token balance for ${tokenAddress}: ${formattedBalance}`);
    return formattedBalance;
  } catch (error) {
    console.error(`Error fetching ERC20 balance for ${tokenAddress}:`, error);
    return '0';
  }
};

export const approveToken = async (
  signer: ethers.Signer, 
  tokenAddress: string, 
  spenderAddress: string, 
  amount: string
) => {
  // For native tokens, no approval needed
  if (tokenAddress === 'NATIVE') {
    return;
  }
  
  const erc20Contract = new ethers.Contract(tokenAddress, [
    'function approve(address spender, uint256 amount) returns (bool)'
  ], signer);
  
  const tx = await erc20Contract.approve(spenderAddress, parseTokenAmount(amount, tokenAddress));
  await tx.wait();
};

export const getTokenAllowance = async (
  signer: ethers.Signer, 
  tokenAddress: string, 
  ownerAddress: string, 
  spenderAddress: string
) => {
  // For native tokens, return max allowance
  if (tokenAddress === 'NATIVE') {
    return ethers.constants.MaxUint256.toString();
  }
  
  // Check if it's a specific token (removed ROOT token specific logic for Flow network)
  // if (tokenAddress.toLowerCase() === 'SPECIFIC_TOKEN_ADDRESS'.toLowerCase()) {
  //   const contract = await getTokenContract(signer);
  //   const allowance = await contract.getSpecificTokenAllowance(ownerAddress);
  //   return ethers.utils.formatUnits(allowance, 6);
  // }
  
  // For other ERC20 tokens, use standard ERC20 interface
  const erc20Contract = new ethers.Contract(tokenAddress, [
    'function allowance(address owner, address spender) view returns (uint256)'
  ], signer);
  
  const allowance = await erc20Contract.allowance(ownerAddress, spenderAddress);
  return ethers.utils.formatEther(allowance);
};

// Get user's token transfer history
export const getUserTokenTransfers = async (signer: ethers.Signer, userAddress: string) => {
  const contract = await getTokenContract(signer);
  const transfers = await contract.getUserTokenTransfers(userAddress);
  
  return transfers.map((transfer: any) => ({
    sender: transfer.sender,
    recipient: transfer.recipient,
    token: transfer.token,
    amount: formatTokenAmount(transfer.amount, transfer.token),
    timestamp: transfer.timestamp.toNumber(),
    status: transfer.status,
    remarks: transfer.remarks,
    isNativeToken: transfer.isNativeToken
  }));
};

// Check if token transfer is possible
export const canTransferToken = async (
  signer: ethers.Signer, 
  senderAddress: string, 
  tokenAddress: string, 
  amount: string
) => {
  const contract = await getTokenContract(signer);
  const result = await contract.canTransferToken(
    senderAddress, 
    tokenAddress, 
    parseTokenAmount(amount, tokenAddress)
  );
  return {
    canTransfer: result[0],
    reason: result[1]
  };
};