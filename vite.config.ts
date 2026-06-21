import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Slugs de artículos del blog para pre-renderizar.
// IMPORTANTE: al agregar un nuevo artículo en src/content/blog/index.ts,
// agregá también su slug aquí para que sea incluido en el SSG build.
const BLOG_SLUGS = [
  'presupuesto-simple-guaranies',
  'errores-comunes-manejo-dinero',
  'registro-gastos-relacion-dinero',
]

export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    // Solo pre-renderizar rutas públicas. Las rutas privadas (/app, /login, /registro)
    // quedan como SPA normal (client-side rendering).
    includedRoutes() {
      return [
        '/',
        '/blog',
        '/finanzas-paraguay',
        ...BLOG_SLUGS.map(slug => `/blog/${slug}`),
      ]
    },
  },
})
