// src/services/api.ts
import axios from 'axios'

const API_URL = 'http://localhost:4000'

// 🔹 Generar mensaje SIWE
export const getMessage = (address: string) =>
  axios.post(`${API_URL}/auth/message`, { address }).then((res: any) => res.data)

// 🔹 Enviar firma y obtener JWT
export const signIn = (message: string, signature: string) =>
  axios.post(`${API_URL}/auth/signin`, { message, signature }).then((res: any) => res.data)

// 🔹 Reclamar tokens usando JWT
export const claimTokens = (token: string) =>
  axios
    .post(`${API_URL}/faucet/claim`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((res: any) => res.data)

// 🔹 Obtener estado del faucet para la dirección (hasClaimed, balance y faucetAmount)
export const getFaucetStatus = (address: string, token: string) =>
  axios
    .get(`${API_URL}/faucet/status/${address}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res: any) => res.data)
