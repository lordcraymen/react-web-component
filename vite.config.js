import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    "process.env": {
      NODE_ENV: "production",
    },
  },
  plugins: [react()],
  build: {
    lib: {
      entry: "./src/index.jsx",
      name: "subscription",
      fileName: (format) => `subscription.${format}.js`,
    },
    target: "esnext",
    rollupOptions: {
      external: ['react', 'three', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          three: 'THREE'
        }
      }
    }
  },
})


