// routes/faucet.js
import express from 'express'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import { faucetAbi } from '../config/contractAbi.js'

dotenv.config()
const router = express.Router()

// 🧩 Configuración del provider (RPC Sepolia)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

// ⚙️ Wallet del owner (usa PRIVATE_KEY del .env)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

// 💧 Conexión con el contrato faucet
const contract = new ethers.Contract(process.env.FAUCET_CONTRACT, faucetAbi, wallet)

// 🪙 Reclamar tokens desde el backend
router.post('/claim', async (req, res) => {
  try {
    const { address } = req.body
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Dirección inválida' })
    }

    console.log(`🚰 Enviando tokens a: ${address}`)

    // ⚠️ Si tu contrato requiere que el owner llame claim(address):
    const tx = await contract.claim(address)

    // Si el contrato usa msg.sender y no recibe address:
    // const tx = await contract.claim()

    await tx.wait()
    res.json({ message: 'Tokens enviados correctamente', txHash: tx.hash })
  } catch (err) {
    console.error('❌ Error al enviar tokens:', err)
    res.status(500).json({ error: 'Error al reclamar tokens' })
  }
})

// 📊 Información general del contrato (opcional)
router.get('/info', async (_req, res) => {
  try {
    const amount = await contract.getFaucetAmount()
    const owner = await contract.owner?.()
    const balance = await provider.getBalance(process.env.FAUCET_CONTRACT)
    res.json({
      faucetAmount: amount.toString(),
      owner,
      contractBalance: ethers.formatEther(balance),
    })
  } catch (err) {
    console.error('❌ Error al obtener info del contrato:', err)
    res.status(500).json({ error: 'Error al obtener información' })
  }
})

export default router
