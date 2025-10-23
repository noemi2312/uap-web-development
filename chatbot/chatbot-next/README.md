# Chatbot Next.js + OpenRouter

## Descripción
Chatbot desarrollado con **Next.js** y **OpenRouter**, cumpliendo la consigna del Ejercicio 13. Permite enviar mensajes y recibir respuestas de un asistente virtual, mostrando indicadores de carga.

## Funcionalidades
- Interfaz responsiva con burbujas para usuario y asistente.
- Scroll automático hacia los mensajes recientes.
- Indicador de “🤖 escribiendo...” mientras se procesa la respuesta.
- Manejo de errores con mensaje de fallback.
- Validación básica de inputs (no se envían mensajes vacíos).
- Backend seguro que maneja la API key mediante `.env.local`.

## Instalación y Configuración

```bash
# Clonar el repositorio y entrar al proyecto
git clone <url-del-repo>
cd chatbot-next

# Instalar dependencias
npm install

# Crear archivo .env.local con la API key y configuración
# NUNCA commitear este archivo
echo "OPENROUTER_API_KEY=api-key-here" >> .env.local
echo "OPENROUTER_BASE_URL=https://openrouter.ai/api/v1" >> .env.local
echo "OPENROUTER_MODEL=anthropic/claude-3-haiku" >> .env.local

# Ejecutar el proyecto en modo desarrollo
npm run dev
