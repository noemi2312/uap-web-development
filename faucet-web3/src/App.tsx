// src/App.tsx
import { useAccount, useDisconnect, useReadContract, useWriteContract } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { formatEther } from 'viem'

// Dirección y ABI del contrato Faucet
const faucetAddress = '0x3e2117c19a921507ead57494bbf29032f33c7412'
const faucetAbi = [
  {
    name: 'getFaucetAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'hasAddressClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'recipient', type: 'address' }],
    outputs: []
  }
]

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const { writeContractAsync, isPending } = useWriteContract()

  // Leer cantidad que entrega el faucet
  const { data: faucetAmount } = useReadContract({
    address: faucetAddress,
    abi: faucetAbi,
    functionName: 'getFaucetAmount',
  })

  // Ver si el usuario ya reclamó
  const { data: hasClaimed } = useReadContract({
    address: faucetAddress,
    abi: faucetAbi,
    functionName: 'hasAddressClaimed',
    args: address ? [address] : undefined,
  })

  // Leer balance del usuario
  const { data: balance, refetch } = useReadContract({
    address: faucetAddress,
    abi: faucetAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Reclamar tokens
  const handleClaim = async () => {
    try {
      await writeContractAsync({
        address: faucetAddress,
        abi: faucetAbi,
        functionName: 'claim',
        args: [address],
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
        <>
          <p>Conectá tu wallet para comenzar</p>
          <button onClick={() => open()}>Conectar Wallet</button>
        </>
      ) : (
        <>
          <p><b>Conectado:</b> {address}</p>
          <p><b>Tokens por reclamo:</b> {faucetAmount ? formatEther(faucetAmount as bigint) : 'Cargando...'} Tokens</p>
          <p><b>¿Ya reclamaste?</b> {hasClaimed ? '✅ Sí' : '❌ No'}</p>
          <p><b>Tu balance:</b> {balance ? formatEther(balance as bigint) : 'Cargando...'} Tokens</p>

          <button onClick={handleClaim} disabled={isPending || !!hasClaimed}>
            💧 Reclamar Tokens
          </button>
          <br /><br />
          <button onClick={() => disconnect()}>Desconectar</button>
        </>
      )}
    </div>
  )
}
