import { httpServerHandler } from 'cloudflare:node';
import app from './server/app';

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS: {
    fetch: typeof fetch;
  };
}

// In Cloudflare Workers with enable_nodejs_http_server_modules:
// app.listen() internally registers the node server and returns a NodeStyleServer
const server = app.listen(0);
const nodeHandler = httpServerHandler(server as any);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API Routes are handled by Express backend
    if (url.pathname.startsWith('/api')) {
      if (env?.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
        (globalThis as any).__GEMINI_API_KEY = env.GEMINI_API_KEY;
      }
      try {
        if (typeof (nodeHandler as any)?.fetch === 'function') {
          return await (nodeHandler as any).fetch(request as any, env as any, ctx as any);
        } else if (typeof nodeHandler === 'function') {
          return await (nodeHandler as any)(request as any, env as any, ctx as any);
        }
      } catch (err: any) {
        console.error('API execution error:', err);
        return new Response(JSON.stringify({ error: err?.message || 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Static assets & Single Page Application fallback handled by Cloudflare Workers Assets
    if (env?.ASSETS?.fetch) {
      const response = await env.ASSETS.fetch(request);
      // If asset not found on a non-file path, fall back to index.html for SPA client-side routing
      if (response.status === 404 && !url.pathname.includes('.')) {
        const spaRequest = new Request(new URL('/', request.url), request);
        return env.ASSETS.fetch(spaRequest);
      }
      return response;
    }

    return new Response('StudyBuddy AI Asset Service Unavailable', { status: 503 });
  },
};
