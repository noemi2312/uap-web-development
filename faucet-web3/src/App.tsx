// src/App.tsx
import { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { signMessage } from '@wagmi/core'
import { config } from './wagmi'
import { getMessage, signIn, claimTokens, getFaucetStatus } from './services/api'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  const [jwt, setJwt] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 🔹 Iniciar sesión con Ethereum (SIWE)
  const handleLogin = async () => {
    try {
      if (!address) return alert('Conectá tu wallet primero')

      // 1️⃣ Obtener mensaje SIWE desde backend
      const { message } = await getMessage(address)

      // 2️⃣ Firmar el mensaje con la wallet
      const signature = await signMessage(config, { message })

      // 3️⃣ Enviar firma para recibir JWT
      const { token } = await signIn(message, signature)
      setJwt(token)

      alert('✅ Sesión iniciada con éxito')
      await fetchStatus(address, token)
    } catch (err) {
      console.error(err)
      alert('❌ Error al iniciar sesión')
    }
  }

  // 🔹 Obtener estado del faucet
  const fetchStatus = async (addr: string, token: string) => {
    try {
      const data = await getFaucetStatus(addr, token)
      setStatus(data)
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 Reclamar tokens
  const handleClaim = async () => {
    if (!jwt) return alert('Debes iniciar sesión primero')
    setLoading(true)
    try {
      const result = await claimTokens(jwt)
      alert(`✅ Tokens reclamados con éxito\nTxHash: ${result.txHash}`)
      if (address) await fetchStatus(address, jwt)
    } catch (err) {
      console.error(err)
      alert('❌ Error al reclamar tokens')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>💧 Faucet Web3 - Sepolia</h1>

      {!isConnected ? (
        <>
          <p>Conectá tu wallet para comenzar</p>
          <button onClick={() => open()}>Conectar Wallet</button>
        </>
      ) : (
        <>
          <p><b>Conectado:</b> {address}</p>

          {!jwt ? (
            <button onClick={handleLogin}>🔐 Iniciar sesión con Ethereum</button>
          ) : (
            <>
              <button onClick={handleClaim} disabled={loading}>
                💧 Reclamar Tokens
              </button>

              <button onClick={() => fetchStatus(address!, jwt!)}>🔄 Actualizar Estado</button>

              {status && (
                <div style={{ marginTop: '1rem' }}>
                  <p><b>Tokens por reclamo:</b> {status.faucetAmount}</p>
                  <p><b>¿Ya reclamaste?</b> {status.hasClaimed ? '✅ Sí' : '❌ No'}</p>
                  <p><b>Balance:</b> {status.balance}</p>
                </div>
              )}
            </>
          )}
          <br /><br />
          <button onClick={() => disconnect()}>Desconectar</button>
        </>
      )}
    </div>
  )
}
