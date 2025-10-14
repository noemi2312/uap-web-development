// faucet.js
import express from 'express'
import { ethers } from 'ethers'
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
  }
]

const contract = new ethers.Contract(process.env.FAUCET_ADDRESS, faucetAbi, wallet)

// Endpoint para reclamar tokens
router.post('/claim', async (req, res) => {
  const { address } = req.body

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

export default router
