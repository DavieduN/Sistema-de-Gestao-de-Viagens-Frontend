import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // O regex ^/(...) captura qualquer requisição que comece com essas palavras e manda para o backend
      '^/(auth|viagem|empregado|motivo|meio-transporte|situacao|cargo|area|historico-viagem|tipo-despesa)': {
        target: 'http://api:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})