import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      tsconfigPath: './tsconfig.lib.json',
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/wallet-sdk/index.ts'),
      name: 'WalletConnectSdk',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'ethers', 'react/jsx-runtime'],
      output: {
        assetFileNames: 'style.css',
      },
    },
  },
})
