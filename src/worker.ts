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

    // API Routes are handled by Express
    if (url.pathname.startsWith('/api')) {
      if (env?.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }
      if (nodeHandler.fetch) {
        return nodeHandler.fetch(request as any, env as any, ctx as any);
      }
    }

    // Static assets & Single Page Application fallback handled by Cloudflare Workers Assets
    return env.ASSETS.fetch(request);
  },
};
