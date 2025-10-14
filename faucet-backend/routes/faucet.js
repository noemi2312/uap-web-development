// routes/faucet.js
import express from 'express'
import { ethers } from 'ethers'
import { verifyToken } from '../middleware/auth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

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
    name: 'getFaucetAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  }
]

const contract = new ethers.Contract(process.env.FAUCET_ADDRESS, faucetAbi, wallet)

// 🔹 Reclamar tokens
router.post('/claim', verifyToken, async (req, res) => {
  const address = req.user.address

  try {
    const tx = await contract.claim(address)
    await tx.wait()
    res.json({ success: true, txHash: tx.hash })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al reclamar tokens' })
  }
})

// 🔹 Obtener estado del faucet
router.get('/status/:address', verifyToken, async (req, res) => {
  const { address } = req.params

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Dirección inválida' })
  }

  try {
    const [hasClaimed, balance, faucetAmount] = await Promise.all([
      contract.hasAddressClaimed(address),
      contract.balanceOf(address),
      contract.getFaucetAmount()
    ])

    res.json({
      hasClaimed,
      balance: ethers.formatEther(balance),
      faucetAmount: ethers.formatEther(faucetAmount)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo estado del faucet' })
  }
})

// 🔹 Obtener lista de usuarios del faucet
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await contract.getFaucetUsers()
    res.json({ users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo lista de usuarios' })
  }
})


export default router
