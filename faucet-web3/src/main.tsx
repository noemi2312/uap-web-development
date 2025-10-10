// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// 👉 Importá la config y el projectId
import { config, projectId } from './config/wagmi'

// 👉 Importá el inicializador de Web3Modal
import { createWeb3Modal } from '@web3modal/wagmi/react'

// 👉 Inicializá el modal (solo una vez)
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // opcional
  themeMode: 'light',
})

// 👉 Crea el cliente para React Query
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
