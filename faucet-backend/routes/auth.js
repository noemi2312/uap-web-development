import express from 'express'
import { SiweMessage } from 'siwe'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

// 🪪 Generar mensaje SIWE (Sign-In with Ethereum)
router.post('/message', (req, res) => {
  const { address } = req.body
  if (!address) return res.status(400).json({ error: 'Falta la dirección' })

  const message = new SiweMessage({
    domain: process.env.DOMAIN || 'localhost',
    address,
    statement: 'Inicia sesión con Ethereum para usar el Faucet.',
    uri: process.env.APP_URI || 'http://localhost:5173',
    version: '1',
    chainId: 11155111, // Sepolia
  })

  res.json({ message: message.prepareMessage() })
})

// 🔐 Verificar firma SIWE y emitir token JWT
router.post('/signin', async (req, res) => {
  try {
    const { message, signature } = req.body
    if (!message || !signature) {
      return res.status(400).json({ error: 'Faltan datos' })
    }

    const siwe = new SiweMessage(message)
    const result = await siwe.verify({ signature })

    if (!result.success)
      return res.status(401).json({ error: 'Firma inválida' })

    const token = jwt.sign({ address: siwe.address }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    res.json({ token })
  } catch (err) {
    console.error('❌ Error verificando firma:', err)
    res.status(500).json({ error: 'Error verificando firma' })
  }
})

export default router
