import { useAccount, useDisconnect } from 'wagmi'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

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
        // ✅ Este botón lo provee Web3Modal automáticamente
        <w3m-button />
      )}
    </div>
  )
}
