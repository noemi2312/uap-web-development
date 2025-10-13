import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import faucetRoutes from './routes/faucet.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/faucet', faucetRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`))
