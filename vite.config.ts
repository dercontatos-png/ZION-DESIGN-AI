import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(""),
      'process.env.API_KEY': JSON.stringify(""),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'formdata-polyfill/esm.min.js': path.resolve(__dirname, 'src/mock-formdata.js'),
        'formdata-polyfill': path.resolve(__dirname, 'src/mock-formdata.js'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/*.log',
          '**/*.txt',
          '**/server-log.txt',
          '**/server-err.txt',
          '**/public/generated-images/**',
          '**/dist/**',
          '**/chave-vertex.json',
          '**/.tempmediaStorage/**'
        ]
      }
    },
  };
});
