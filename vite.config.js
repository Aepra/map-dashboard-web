import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make environment variables available in build
    'import.meta.env.VITE_DEPLOY_TYPE': JSON.stringify(process.env.VITE_DEPLOY_TYPE || 'vercel'),
    'import.meta.env.VITE_DATA_SOURCE_URL': JSON.stringify(process.env.VITE_DATA_SOURCE_URL || 'https://raw.githubusercontent.com/Aepra/map-data-pipeline/main/data/peta_murid.parquet'),
  },
})
