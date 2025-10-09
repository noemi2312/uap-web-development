// src/config/web3.ts
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { sepolia } from 'wagmi/chains'

// 👉 1. Project ID de WalletConnect (crealo en https://cloud.walletconnect.com)
const projectId = 'TU_PROJECT_ID_DE_WEB3MODAL'

// 👉 2. Configuración de metadata (usada por WalletConnect)
export const metadata = {
  name: 'Faucet Token',
  description: 'dApp FaucetToken on Sepolia',
  url: 'http://localhost:5173', // tu dominio o localhost
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 👉 3. Redes soportadas
export const chains = [sepolia] as const

// 👉 4. Config Wagmi con Web3Modal
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata
})

// 👉 5. Inicialización del modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // opcional
  themeMode: 'light'
})
