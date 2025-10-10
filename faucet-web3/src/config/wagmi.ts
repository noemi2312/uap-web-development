// src/config/wagmi.ts
import { defaultWagmiConfig } from '@web3modal/wagmi/react'
import { sepolia } from 'viem/chains'

// 🔐 Project ID de Web3Modal (obtenelo en https://cloud.walletconnect.com)
export const projectId = '3dea841a0f284fac6b8dedf3bb35d88f'

// Configuración principal
export const config = defaultWagmiConfig({
  chains: [sepolia],
  projectId,
  metadata: {
    name: 'Faucet Web3',
    description: 'App para reclamar tokens en testnet',
    url: 'https://mi-faucet.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
})
