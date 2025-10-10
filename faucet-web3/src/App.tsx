// src/App.tsx
import { useAccount, useDisconnect, useReadContract, useWriteContract } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { faucetAddress, faucetAbi } from './config/contract'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  // Leer balance del faucet
  const { data: balance, refetch } = useReadContract({
    address: faucetAddress,
    abi: faucetAbi,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  })

  // Escribir (hacer claim)
  const { writeContractAsync, isPending } = useWriteContract()

  const handleClaim = async () => {
    try {
      await writeContractAsync({
        address: faucetAddress,
        abi: faucetAbi,
        functionName: 'claim',
      })
      await refetch()
      alert('✅ Tokens reclamados correctamente')
    } catch (err) {
      console.error(err)
      alert('❌ Error al reclamar tokens')
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>💧 Faucet Token - Sepolia</h1>
      {!isConnected ? (
        <button onClick={() => open()}>Conectar Wallet</button>
      ) : (
        <>
          <p><b>Conectado:</b> {address}</p>
          <p>Balance: {balance ? balance.toString() : 'Cargando...'}</p>
          <button onClick={handleClaim} disabled={isPending}>💧 Reclamar Tokens</button>
          <br /><br />
          <button onClick={() => disconnect()}>Desconectar</button>
        </>
      )}
    </div>
  )
}
