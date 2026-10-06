import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import { apiRouter } from './src/server/api.ts';
import {startBackupScheduler} from './src/server/backup.ts';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          const app = express();
          app.use(apiRouter);
          server.middlewares.use('/api', app);
          const stopBackupScheduler = startBackupScheduler();
          server.httpServer?.once('close', () => {
            void stopBackupScheduler().catch(() => undefined);
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, '.'),
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
