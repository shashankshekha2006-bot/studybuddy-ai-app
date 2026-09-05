import { askQuestion, generateQuiz, generateNotes } from './server/geminiService';

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS: {
    fetch: typeof fetch;
  };
}

// In-memory rate limiting per worker isolate
const ipCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 60;

function checkRateLimit(request: Request): boolean {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const data = ipCounts.get(ip);
  if (!data || now > data.resetTime) {
    ipCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (data.count >= MAX_REQUESTS) {
    return false;
  }
  data.count += 1;
  return true;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Health Check Endpoint
    if (url.pathname === '/api/health') {
      const hasApiKey = Boolean(env?.GEMINI_API_KEY || (globalThis as any).__GEMINI_API_KEY || process.env.GEMINI_API_KEY);
      return jsonResponse({
        status: 'ok',
        hasApiKey,
        runtime: 'cloudflare-worker',
        timestamp: new Date().toISOString(),
      });
    }

    // AI Ask Endpoint
    if (url.pathname === '/api/ask') {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method Not Allowed' }, 405);
      }
      if (!checkRateLimit(request)) {
        return jsonResponse({ error: 'Too many requests. Please wait a minute before asking another question!' }, 429);
      }
      try {
        const body = await request.json();
        const result = await askQuestion(body as any, env?.GEMINI_API_KEY);
        return jsonResponse(result);
      } catch (err: any) {
        console.error('Error in /api/ask:', err);
        return jsonResponse({ error: err?.message || 'Failed to process question' }, 500);
      }
    }

    // AI Quiz Generator Endpoint
    if (url.pathname === '/api/quiz') {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method Not Allowed' }, 405);
      }
      if (!checkRateLimit(request)) {
        return jsonResponse({ error: 'Too many requests. Please wait a minute!' }, 429);
      }
      try {
        const body = await request.json();
        const result = await generateQuiz(body as any, env?.GEMINI_API_KEY);
        return jsonResponse(result);
      } catch (err: any) {
        console.error('Error in /api/quiz:', err);
        return jsonResponse({ error: err?.message || 'Failed to generate quiz' }, 500);
      }
    }

    // AI Notes Generator Endpoint
    if (url.pathname === '/api/notes') {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method Not Allowed' }, 405);
      }
      if (!checkRateLimit(request)) {
        return jsonResponse({ error: 'Too many requests. Please wait a minute!' }, 429);
      }
      try {
        const body = await request.json();
        const result = await generateNotes(body as any, env?.GEMINI_API_KEY);
        return jsonResponse(result);
      } catch (err: any) {
        console.error('Error in /api/notes:', err);
        return jsonResponse({ error: err?.message || 'Failed to generate notes' }, 500);
      }
    }

    // Static assets & Single Page Application fallback handled by Cloudflare Workers Assets
    if (env?.ASSETS?.fetch) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && !url.pathname.includes('.')) {
        const spaRequest = new Request(new URL('/', request.url), request);
        return env.ASSETS.fetch(spaRequest);
      }
      return response;
    }

    return new Response('StudyBuddy AI Asset Service Unavailable', { status: 503 });
  },
};
