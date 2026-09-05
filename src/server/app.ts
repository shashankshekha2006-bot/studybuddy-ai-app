import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { askQuestion, generateQuiz, generateNotes, getGeminiClient } from './geminiService';

dotenv.config();

export const app = express();

app.use(express.json({ limit: '1mb' }));

// In-memory rate limiter: max 60 requests per minute per IP
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp =
    (req.headers['cf-connecting-ip'] as string) ||
    (req.headers['x-forwarded-for'] as string) ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const clientData = ipRequestCounts.get(clientIp);

  if (!clientData || now > clientData.resetTime) {
    ipRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute before asking another question! (कृपया एक मिनट प्रतीक्षा करें)',
    });
  }

  clientData.count += 1;
  next();
}

// 1. Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY || (globalThis as any).__GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey,
    runtime: typeof (globalThis as any).WebSocketPair !== 'undefined' ? 'cloudflare-worker' : 'node',
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Question Answering route
app.post('/api/ask', rateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await askQuestion(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process your question. Please try again in a few moments.',
    });
  }
});

// 3. AI Quiz Generator route
app.post('/api/quiz', rateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await generateQuiz(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/quiz:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate quiz. Please try again.',
    });
  }
});

// 4. AI Notes Generator route
app.post('/api/notes', rateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await generateNotes(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/notes:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate study notes. Please try again.',
    });
  }
});

export { getGeminiClient };
export default app;
