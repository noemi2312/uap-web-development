// src/App.tsx
import React, { useState, useEffect } from 'react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import * as api from './services/api'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const { signMessageAsync } = useSignMessage()

  const [jwt, setJwt] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    hasClaimed: boolean
    balance: string
    faucetAmount: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  // 🔹 Autenticación con SIWE
  const handleLogin = async () => {
    if (!address) return
    try {
      const { message } = await api.getMessage(address)
      const signature = await signMessageAsync({ message })
      const { token } = await api.signIn(message, signature)
      setJwt(token)
      localStorage.setItem('jwt', token)
    } catch (err) {
      console.error(err)
      alert('❌ Error al iniciar sesión')
    }
  }

  // 🔹 Obtener estado del faucet
  const fetchStatus = async () => {
    if (!address || !jwt) return
    setLoading(true)
    try {
      const data = await api.getFaucetStatus(address, jwt)
      setStatus(data)
    } catch (err) {
      console.error(err)
      alert('❌ Error obteniendo estado del faucet')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Reclamar tokens
  const handleClaim = async () => {
    if (!jwt) return
    setLoading(true)
    try {
      const { txHash } = await api.claimTokens(jwt)
      alert(`✅ Tokens reclamados. TxHash: ${txHash}`)
      await fetchStatus()
    } catch (err) {
      console.error(err)
      alert('❌ Error al reclamar tokens')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Refrescar estado al cambiar JWT o dirección
  useEffect(() => {
    fetchStatus()
  }, [jwt, address])

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>💧 Faucet Token - Sepolia</h1>

      {!isConnected ? (
        <>
          <p>Conectá tu wallet para comenzar</p>
          <button onClick={() => open()}>Conectar Wallet</button>
        </>
      ) : !jwt ? (
        <>
          <p><b>Conectado:</b> {address}</p>
          <button onClick={handleLogin}>Iniciar sesión con Ethereum</button>
          <br /><br />
          <button onClick={() => disconnect()}>Desconectar</button>
        </>
      ) : (
        <>
          <p><b>Conectado:</b> {address}</p>
          {loading || !status ? (
            <p>Cargando información del faucet...</p>
          ) : (
            <>
              <p><b>Tokens por reclamo:</b> {status.faucetAmount}</p>
              <p><b>¿Ya reclamaste?</b> {status.hasClaimed ? '✅ Sí' : '❌ No'}</p>
              <p><b>Tu balance:</b> {status.balance}</p>

              <button onClick={handleClaim} disabled={loading || status.hasClaimed}>
                💧 Reclamar Tokens
              </button>
              <br /><br />
              <button onClick={() => { disconnect(); setJwt(null) }}>Desconectar</button>
            </>
          )}
        </>
      )}
    </div>
  )
}
