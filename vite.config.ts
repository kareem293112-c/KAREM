import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        manifest: {
          short_name: "المحاسب الذكي",
          name: "نظام المحاسب الذكي المتكامل",
          description: "إدارة مخزونك، مبيعاتك، وأرباحك وخسائرك في مكان واحد دون اتصال بالإنترنت",
          icons: [
            {
              "src": "/icon.svg",
              "type": "image/svg+xml",
              "sizes": "any",
              "purpose": "any"
            },
            {
              "src": "/icon.svg",
              "type": "image/svg+xml",
              "sizes": "192x192",
              "purpose": "maskable"
            },
            {
              "src": "/icon.svg",
              "type": "image/svg+xml",
              "sizes": "512x512",
              "purpose": "maskable"
            }
          ],
          start_url: "/",
          background_color: "#1e1b4b",
          theme_color: "#312e81",
          display: "standalone",
          orientation: "any"
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,json,webmanifest}']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
