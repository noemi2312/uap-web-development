import express from 'express'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import { verifyToken } from '../middleware/auth.js'

dotenv.config()
const router = express.Router()

// 🔹 Conexión a blockchain
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

const faucetAbi = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'recipient', type: 'address' }],
    outputs: []
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
    name: 'getFaucetUsers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }]
  }
]

const contract = new ethers.Contract(process.env.FAUCET_ADDRESS, faucetAbi, wallet)

// 🔹 Reclamar tokens (protegido)
router.post('/claim', verifyToken, async (req, res) => {
  const address = req.user.address

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Dirección inválida' })
  }

  try {
    const tx = await contract.claim(address)
    await tx.wait()
    res.json({ success: true, txHash: tx.hash })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al reclamar tokens' })
  }
})

// 🔹 Consultar estado de usuario (protegido)
router.get('/status/:address', verifyToken, async (req, res) => {
  const { address } = req.params

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Dirección inválida' })
  }

  try {
    const hasClaimed = await contract.hasAddressClaimed(address)
    const balance = await contract.balanceOf(address)
    const users = await contract.getFaucetUsers()
    res.json({
      hasClaimed,
      balance: balance.toString(),
      users
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo status' })
  }
})

export default router
