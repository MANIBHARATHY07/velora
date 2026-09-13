import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Transform JSX in all .js files (not just .jsx)
      include: /\.[jt]sx?$/,
    }),
  ],
  resolve: {
    extensions: ['.js', '.json'],
  },
  esbuild: {
    // Tell esbuild to parse .js as JSX as well
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
