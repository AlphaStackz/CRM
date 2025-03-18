import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/* export default defineConfig({
  plugins: [react()],
  server: { 
    proxy: { 
      "/api": "http://localhost:3000" 
    } 
  }
}) */

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend server
        changeOrigin: true, // Modifies the origin header in request to match target server
        secure: false, //ensures local host -->no https
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' prefix, because using /users in backend
      },
    },
  },
});