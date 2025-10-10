import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>💧 Faucet Token - Sepolia</h1>
      <p>Conectá tu wallet para comenzar</p>

      {isConnected ? (
        <>
          <p><b>Conectado:</b> {address}</p>
          <button onClick={() => disconnect()}>Desconectar</button>
        </>
      ) : (
        <button onClick={() => open()}>Conectar Wallet</button>
      )}
    </div>
  )
}
