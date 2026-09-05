import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './src/server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

// Local Development Server (used by AI Studio dev environment on port 3000)
// For Cloudflare Workers deployment, wrangler uses src/worker.ts as configured in wrangler.jsonc.
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyBuddy AI dev server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
