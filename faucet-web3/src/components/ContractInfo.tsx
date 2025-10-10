import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'

// Dirección y ABI del faucet
const contractAddress = '0x3e2117c19a921507ead57494bbf29032f33c7412'
const contractABI = [
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
  }
]

export default function ContractInfo() {
  const { address, isConnected } = useAccount()

  // Cantidad de tokens que da el faucet
  const { data: faucetAmount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getFaucetAmount',
  })

  // Si la dirección ya reclamó tokens
  const { data: alreadyClaimed } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'hasAddressClaimed',
    args: address ? [address] : undefined,
  })

  // Balance del usuario
  const { data: userBalance } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  if (!isConnected) {
    return <p>Conectá tu wallet para ver los datos del contrato.</p>
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '1rem' }}>
      <h2>📊 Información del Faucet</h2>
      <p><strong>Tokens por reclamo:</strong> {faucetAmount ? formatEther(faucetAmount as bigint) : 'Cargando...'} Tokens</p>
      <p><strong>¿Ya reclamaste?</strong> {alreadyClaimed ? '✅ Sí' : '❌ No'}</p>
      <p><strong>Tu balance:</strong> {userBalance ? formatEther(userBalance as bigint) : 'Cargando...'} Tokens</p>
    </div>
  )
}
