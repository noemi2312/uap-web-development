const nextConfig = {
  output: 'standalone', // Importante para Docker y Vercel
  images: {
    domains: ['books.google.com', 'via.placeholder.com'],
    unoptimized: true, // Para deploy estático si es necesario
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig