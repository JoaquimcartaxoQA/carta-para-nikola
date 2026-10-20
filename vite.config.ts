import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const isUserSite = repositoryName?.endsWith('.github.io') ?? false;
  const base = process.env.GITHUB_ACTIONS === 'true' && repositoryName && !isUserSite
    ? `/${repositoryName}/`
    : '/';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        scope: base,
        includeAssets: ['icon.svg'],
        manifest: {
          id: base,
          name: 'Nikola Race: A Grande Corrida',
          short_name: 'Nikola Race',
          description: 'Jogo de corrida infantil 2D para Nikola Cartaxo correr contra Papai Rafael e Mamãe Hevila.',
          theme_color: '#dc2626',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'landscape',
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}icon.svg`,
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
