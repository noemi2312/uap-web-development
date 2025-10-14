import express from 'express'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const router = express.Router()
const messages = new Map()

// Generar mensaje SIWE
router.post('/message', (req, res) => {
  const { address } = req.body
  if (!address) return res.status(400).json({ error: 'Address is required' })

  const message = `Sign this message to authenticate: ${randomBytes(16).toString('hex')}`
  messages.set(address, message)
  res.json({ message })
})

// Verificar firma y generar token JWT
router.post('/signin', (req, res) => {
  const { message, signature } = req.body
  if (!message || !signature) return res.status(400).json({ error: 'Missing data' })

  // En un caso real, verificarías la firma con ethers.js
  const address = '0x' + message.slice(-40) // simulamos extracción del address
  const storedMessage = messages.get(address)
  if (!storedMessage || storedMessage !== message) {
    return res.status(400).json({ error: 'Invalid message or address' })
  }

  // ✅ Crear token con expiración de 1 hora
  const token = jwt.sign({ address }, process.env.JWT_SECRET, { expiresIn: '1h' })
  res.json({ token })
})

export default router
