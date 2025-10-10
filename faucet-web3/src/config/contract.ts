// src/config/contract.ts
import { sepolia } from 'viem/chains'

export const faucetAddress = '0x0000000000000000000000000000000000000000' // 👈 reemplazá por tu dirección real

// ABI mínimo de un faucet: función claim() y balanceOf(address)
export const faucetAbi = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
]

export const faucetChain = sepolia
