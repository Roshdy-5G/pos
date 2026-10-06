import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/api.ts';
import {startBackupScheduler} from './src/server/backup.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve static frontend files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

const stopBackupScheduler = startBackupScheduler();
let isShuttingDown = false;

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    server.close(async (error) => {
      if (error) console.error('HTTP server shutdown failed:', error);
      try {
        await stopBackupScheduler();
      } catch {
        process.exitCode = 1;
      }
    });
  });
}
