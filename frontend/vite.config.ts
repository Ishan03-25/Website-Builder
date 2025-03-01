import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
// export default defineConfig({
  // plugins: [react(), tailwindcss()],
  // server: {
  //   headers: {
  //     "Cross-Origin-Opener-Policy": "same-origin",
  //     "Cross-Origin-Embedder-Policy": "require-corp"
  //   },
  //   https: true,
  //   strictPort: true,
  //   port: 5173
  // },
  // build: {
  //   target: 'esnext', // Required for WebContainers
  //   sourcemap: true
  // }
// })

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  }
})