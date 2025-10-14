# 💧 Faucet Web3 - React + Node + Ethereum Sepolia

Proyecto realizado para el **Ejercicio 12**: Aplicación React Web3 con Faucet Token.

---

## 🚀 Descripción del Proyecto

Esta aplicación permite conectar una wallet (MetaMask), consultar el estado de un contrato Faucet en la testnet **Ethereum Sepolia**, y reclamar tokens de manera autenticada a través de un backend Node.js.

---

## ⚙️ Tecnologías Utilizadas

### **Frontend**
- React + Vite
- TypeScript
- Ethers.js
- Axios
- Vite para desarrollo local

### **Backend**
- Node.js + Express
- Ethers.js
- dotenv
- jsonwebtoken
- Middleware de autenticación JWT

### **Blockchain**
- Red: Ethereum Sepolia Testnet
- RPC: `https://ethereum-sepolia-rpc.publicnode.com`
- Contrato: [`0x3e2117c19a921507ead57494bbf29032f33c7412`](https://sepolia.etherscan.io/address/0x3e2117c19a921507ead57494bbf29032f33c7412#code)

---

## 🧩 Funcionalidades Implementadas

### 🔹 Frontend
✅ Conexión de wallet (MetaMask)  
✅ Verificación del estado del faucet  
✅ Reclamo de tokens (una vez por dirección)  
✅ Visualización del balance del usuario  
✅ Interfaz básica para interacción con el backend  

### 🔹 Backend
✅ Endpoint `/faucet/claim` — Ejecuta el reclamo en el contrato  
✅ Endpoint `/faucet/status/:address` — Devuelve estado, balance y cantidad reclamada  
✅ Middleware de autenticación con JWT (`verifyToken`)  
✅ Conexión a Sepolia mediante `ethers`  
✅ Variables de entorno seguras (.env)

---

## 🧰 Variables de Entorno (.env)

Ejemplo de archivo `.env` usado en el backend:

