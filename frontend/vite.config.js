import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const port = process.env.VITE_APP_PORT;
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
});
