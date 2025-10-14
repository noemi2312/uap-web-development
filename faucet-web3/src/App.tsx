// src/App.tsx
import React, { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  const [jwt, setJwt] = useState<string | null>(null)
  const [status, setStatus] = useState<{ hasClaimed: boolean; balance: string; users: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para iniciar sesión con SIWE
  const handleLogin = async () => {
    if (!address) return

    try {
      // 1️⃣ Solicitar mensaje al backend
      const msgRes = await fetch('http://localhost:4000/auth/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const { message } = await msgRes.json()

      // 2️⃣ Firmar el mensaje en la wallet
      const provider = (window as any).ethereum
      if (!provider) throw new Error('No hay proveedor de Ethereum disponible')
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      })

      // 3️⃣ Enviar firma al backend
      const signinRes = await fetch('http://localhost:4000/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      })
      const data = await signinRes.json()
      setJwt(data.token)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al iniciar sesión')
    }
  }

  // Función para reclamar tokens
  const handleClaim = async () => {
    if (!jwt) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:4000/faucet/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Error al reclamar tokens')
      await fetchStatus() // Refrescar estado
      alert(`✅ Tokens reclamados. TxHash: ${data.txHash}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al reclamar tokens')
    } finally {
      setLoading(false)
    }
  }

  // Función para consultar estado del usuario
  const fetchStatus = async () => {
    if (!jwt || !address) return
    try {
      const res = await fetch(`http://localhost:4000/faucet/status/${address}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      console.error(err)
    }
  }

  // Refrescar estado cuando se loguea
  useEffect(() => {
    if (jwt) fetchStatus()
  }, [jwt])

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
        </>
      ) : (
        <>
          <p><b>Conectado y autenticado:</b> {address}</p>
          <p><b>¿Ya reclamaste?</b> {status ? (status.hasClaimed ? '✅ Sí' : '❌ No') : 'Cargando...'}</p>
          <p><b>Tu balance:</b> {status ? status.balance : 'Cargando...'} Tokens</p>
          <p><b>Total usuarios:</b> {status ? status.users.length : 'Cargando...'}</p>

          <button onClick={handleClaim} disabled={loading || status?.hasClaimed}>
            💧 Reclamar Tokens
          </button>
          <br /><br />
          <button onClick={() => { disconnect(); setJwt(null); setStatus(null); }}>Desconectar</button>
        </>
      )}

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
    </div>
  )
}
