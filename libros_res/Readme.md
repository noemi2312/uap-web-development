# 📚 Plataforma de Descubrimiento y Reseñas de Libros

Una plataforma moderna para descubrir, explorar y reseñar libros
utilizando la API de Google Books.

## 🚀 Demo en Vivo

**Aplicación en producción:**\
➡️ https://reslibros.vercel.app

## ✨ Características Principales

-   **🔍 Búsqueda de libros** por título, autor o ISBN (Google Books
    API)
-   **📖 Información detallada**: portadas, descripción, metadatos
-   **⭐ Sistema de reseñas**: calificación de 1 a 5 estrellas y
    comentarios
-   **👍 Votación comunitaria**: destacar reseñas útiles
-   **📱 Diseño responsive**: interfaz adaptada a todos los dispositivos

## 🛠️ Tecnologías Utilizadas

### **Frontend**

-   Next.js 14 (App Router)
-   TypeScript
-   Tailwind CSS
-   Vitest & Testing Library
-   React Hooks

### **Backend**

-   Node.js + Express
-   Prisma ORM
-   SQLite (desarrollo) / configurable para producción

### **DevOps & Deployment**

-   Vercel (frontend)
-   GitHub Actions (CI/CD)
-   Docker
-   GitHub Container Registry

## 🏗️ Estructura del Proyecto

    libros-platform/
    ├── frontend/               # Aplicación Next.js
    │   ├── app/                # App Router (páginas y layouts)
    │   ├── components/         # Componentes reutilizables
    │   ├── lib/                # Configuración y utilidades
    │   ├── tests/              # Pruebas unitarias
    │   └── package.json
    ├── backend/                # API con Express
    │   ├── src/
    │   │   ├── controllers/    # Lógica de negocio
    │   │   ├── routes/         # Definición de rutas
    │   │   └── index.ts        # Servidor principal
    │   └── package.json
    ├── .github/workflows/      # Pipelines de CI/CD
    ├── Dockerfile              # Configuración Docker
    └── README.md

## 🚀 Desarrollo Local

### **Prerrequisitos**

-   Node.js 18+
-   npm o yarn
-   Git

## ▶️ Instalación y Ejecución

### **1. Clonar repositorio**

``` bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### **Frontend (Next.js)**

``` bash
cd frontend
npm install
npm run dev
```

Aplicación: http://localhost:3000

### **Backend (Express API)**

``` bash
cd backend
npm install
npm run dev
```

API: http://localhost:3001

## 🔐 Variables de Entorno

### frontend/.env.local

    NEXT_PUBLIC_API_URL=http://localhost:3001

### backend/.env

    DATABASE_URL="file:./dev.db"

## 🐳 Docker

### **Construcción y ejecución**

``` bash
docker build -t libros-platform ./frontend
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL="https://tu-api.com" libros-platform
```

### **Imagen pre-construida**

``` bash
docker pull ghcr.io/tu-usuario/tu-repositorio:latest
```

## 📦 Deployment

### **Frontend en Vercel**

-   Deploy automático al hacer push en `main`
-   Variables configuradas en Vercel
-   Producción: https://reslibros.vercel.app

### Variables necesarias

    NODE_ENV=production
    NEXT_PUBLIC_API_URL=https://tu-backend.com

## 🤖 GitHub Actions (CI/CD)

### **1. Build Verification**

-   Compila frontend + backend
-   Verifica errores de build

### **2. Test Suite**

-   Corre Vitest + Testing Library

### **3. Docker Container**

-   Construcción automática
-   Publicación en GHCR

## 🧪 Testing

### Frontend

``` bash
npm test
npm run test:run
```

## 📚 API de Google Books

Base: https://www.googleapis.com/books/v1/volumes

### Ejemplos

``` js
fetch('https://www.googleapis.com/books/v1/volumes?q=harry+potter')
fetch('https://www.googleapis.com/books/v1/volumes?q=inauthor:rowling')
fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:9780439708180')
```

## 🤝 Contribución

1.  Fork
2.  Crear rama
3.  Commit
4.  Push
5.  PR

## 📄 Licencia

Licencia MIT.

## 🆘 Soporte

Abrir issue con pasos para reproducir.

## 🔄 Estado del Proyecto

### Completado

-   Deploy Vercel
-   CI/CD
-   Docker
-   Tests
-   Documentación

### Producción

https://reslibros.vercel.app
