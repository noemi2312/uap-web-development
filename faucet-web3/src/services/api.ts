import axios from 'axios'

const API_URL = 'http://localhost:4000'

export const getMessage = (address: string) =>
  axios.post(`${API_URL}/auth/message`, { address }).then(res => res.data)

export const signIn = (message: string, signature: string) =>
  axios.post(`${API_URL}/auth/signin`, { message, signature }).then(res => res.data)

export const claimTokens = (token: string) =>
  axios.post(`${API_URL}/faucet/claim`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data)

export const getFaucetStatus = (address: string, token: string) =>
  axios.get(`${API_URL}/faucet/status/${address}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data)
