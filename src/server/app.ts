import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

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

// Initialize Gemini client with mandatory User-Agent header
export function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || (globalThis as any).__GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient generation with model cascade (gemini-3.8-flash -> gemini-3.1-flash-lite)
async function generateWithFallback(ai: GoogleGenAI, params: { prompt: string; schema: any }) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: params.schema,
        },
      });

      let text = response.text?.trim();
      if (text) {
        // Strip markdown code fences if model enclosed JSON
        if (text.startsWith('```')) {
          text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        }
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed:`, err?.message || err);
      lastError = err;
      // brief pause before trying alternate model
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  throw lastError || new Error('All model attempts failed');
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
    const { question, subject, classLevel, language, explanationLevel } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a valid school question. (कृपया एक प्रश्न पूछें)' });
    }

    if (question.length > 2000) {
      return res.status(400).json({ error: 'Question is too long (maximum 2000 characters).' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Mock/Offline fallback response
      return res.json({
        finalAnswer: `Core Concept for Class ${classLevel || 10} (${subject || 'General'}): Remember to state standard textbook definitions and units.`,
        simpleExplanation: `For Class ${classLevel || 10} students learning in ${language || 'English'}, this topic revolves around foundational NCERT concepts. We break down the question into simple relatable components with real-world examples.`,
        stepByStepSolution: [
          `Step 1: Identify given information and the exact variable or concept requested in the question.`,
          `Step 2: State the appropriate NCERT formula, theorem, or standard definition for Class ${classLevel || 10}.`,
          `Step 3: Perform intermediate calculations or logical reasoning step-by-step.`,
          `Step 4: Conclude with the final value accompanied by standard SI units.`,
        ],
        importantPoints: [
          `Focus on keywords highlighted in board syllabus guidelines.`,
          `Always write units (e.g., cm², m/s, Joules) in science and mathematics solutions.`,
          `Practice drawing neat labeled diagrams where applicable in exams.`,
        ],
        examTip: `Examiners reward step-by-step marking. Highlight your final answer in a neat box! (बोर्ड परीक्षा टिप: उत्तर को बॉक्स में लिखें)`,
      });
    }

    const prompt = `
You are "StudyBuddy AI", a warm, encouraging, expert school tutor specially built for Indian students from Class 5 to Class 12 (CBSE, ICSE, and State Boards).

Student Profile:
- Class: Class ${classLevel} (Indian education curriculum)
- Subject: ${subject}
- Preferred Language: ${language} (Options: English, Hindi, or Hinglish)
- Preferred Explanation Level: ${explanationLevel} (Simple, Detailed, or Exam-focused)

Student's Question:
"${question}"

Pedagogical Directives:
1. Tailor depth strictly to a Class ${classLevel} student in India.
2. If Language is 'Hindi', write in fluent, natural Devanagari Hindi with key technical terms in English brackets (e.g. प्रकाश संश्लेषण (Photosynthesis)).
3. If Language is 'Hinglish', write in conversational Hindi in Latin script / mixed English that Indian teenagers easily grasp.
4. If Language is 'English', use simple, clear Indian school English.
5. If Mathematics or Physics, show step-by-step calculations with formulas and units.
6. If Science, explain concepts with relatable everyday examples (e.g. kitchen experiments, cricket, Indian seasons).
7. If Social Science, cite relevant historical events, constitutional points, or geography clearly.
8. If uncertain or ambiguous, explain assumptions gently.
9. Always include practical exam tips for board exams (step-marking, keywords).

Format your response strictly as JSON with this exact schema:
{
  "finalAnswer": "A concise, clear 1-3 sentence summary of the answer",
  "simpleExplanation": "A friendly, easy-to-understand conceptual explanation using simple analogies",
  "stepByStepSolution": ["Step 1 explanation or calculation", "Step 2 ...", "Step 3 ..."],
  "importantPoints": ["Key takeaway point 1", "Key takeaway point 2", "Key takeaway point 3"],
  "examTip": "A specific scoring tip for school/board exams (e.g., marks distribution, common mistakes to avoid, keyword to underline)"
}
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        finalAnswer: { type: Type.STRING },
        simpleExplanation: { type: Type.STRING },
        stepByStepSolution: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        importantPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        examTip: { type: Type.STRING },
      },
      required: ['finalAnswer', 'simpleExplanation', 'stepByStepSolution', 'importantPoints', 'examTip'],
    };

    const parsed = await generateWithFallback(ai, { prompt, schema });
    return res.json(parsed);
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
    const { classLevel, subject, topic, numQuestions = 5, language = 'English' } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a topic or chapter name for the quiz.' });
    }

    const count = Math.min(Math.max(Number(numQuestions) || 5, 3), 10);
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: `${subject} Quiz: ${topic}`,
        topic,
        subject,
        classLevel,
        questions: [
          {
            id: 'q1',
            question: `In Class ${classLevel} ${subject}, which of the following is the fundamental concept of ${topic}?`,
            options: ['Basic Definition A', 'Fundamental Principle B', 'Application Rule C', 'Alternative Hypothesis D'],
            correctIndex: 1,
            explanation: `Option B represents the standard textbook principle taught in NCERT Class ${classLevel}.`,
          },
          {
            id: 'q2',
            question: `Which unit or formula is primarily associated with ${topic}?`,
            options: ['SI Standard Unit', 'Derived Quantity', 'Dimensionless Ratio', 'Empirical Constant'],
            correctIndex: 0,
            explanation: 'SI Units are crucial in school examinations for full credit.',
          },
          {
            id: 'q3',
            question: `Which of the following common errors should be avoided in ${topic}?`,
            options: ['Writing formulas', 'Omitting units or reasons', 'Underlining keywords', 'Checking answers'],
            correctIndex: 1,
            explanation: 'Omitting units or geometric reasons frequently leads to deduction of marks in board exams.',
          },
        ],
      });
    }

    const prompt = `
You are an expert Indian school examiner creating an engaging, pedagogical multiple-choice quiz for:
- Student Class: Class ${classLevel}
- Subject: ${subject}
- Chapter/Topic: "${topic}"
- Number of Questions: ${count}
- Language: ${language} (If Hindi, write questions and options in Devanagari Hindi)

Create exactly ${count} multiple-choice questions aligned with NCERT / CBSE curriculum standards for Class ${classLevel}.
Each question must have exactly 4 plausible options, a correct option index (0, 1, 2, or 3), and an encouraging, clear explanation of why that answer is correct.

Format your response strictly as JSON with this exact schema:
{
  "title": "Quiz Title (e.g., Class 10 Science: Chemical Reactions)",
  "topic": "${topic}",
  "subject": "${subject}",
  "classLevel": ${classLevel},
  "questions": [
    {
      "id": "q_1",
      "question": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation for student learning..."
    }
  ]
}
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        topic: { type: Type.STRING },
        subject: { type: Type.STRING },
        classLevel: { type: Type.NUMBER },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
      required: ['title', 'topic', 'subject', 'classLevel', 'questions'],
    };

    const parsed = await generateWithFallback(ai, { prompt, schema });
    return res.json(parsed);
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
    const { classLevel, subject, topic, language = 'English' } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a topic or chapter name to generate notes.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        id: `notes_${Date.now()}`,
        title: `Quick Revision Notes: ${topic}`,
        topic,
        subject,
        classLevel,
        language,
        importantDefinitions: [
          {
            term: `${topic} (Core Definition)`,
            definition: `The fundamental concept in Class ${classLevel} ${subject} explaining how the system or phenomenon operates according to standard curriculum guidelines.`,
          },
          {
            term: 'Key Terminology',
            definition: 'Specialized words and identifiers used in examination questions to assess conceptual mastery.',
          },
        ],
        keyPoints: [
          `Key concept 1: Always relate the theoretical rule to its observed behavior.`,
          `Key concept 2: Memorize core formulas, dates, or classifications as per syllabus.`,
          `Key concept 3: Structured points score higher than unorganized paragraphs in school exams.`,
        ],
        examples: [
          `Example 1: A practical situation seen in daily Indian household life demonstrating this principle.`,
          `Example 2: A standard textbook problem with given values and logical deduction.`,
        ],
        quickRevision: [
          `Formula / Rule checklist for rapid last-minute revision.`,
          `Check units and sign conventions.`,
          `Remember common exceptions or NCERT "Did You Know" boxes.`,
        ],
        timestamp: Date.now(),
      });
    }

    const prompt = `
You are an expert NCERT teacher creating structured, high-yield study and revision notes for Indian students:
- Class: Class ${classLevel}
- Subject: ${subject}
- Topic / Chapter: "${topic}"
- Language: ${language} (If Hindi, write in clear Devanagari Hindi with key technical terms in English brackets)

Requirements:
1. "importantDefinitions": 3 to 5 core definitions with clear terms and student-friendly meanings.
2. "keyPoints": 4 to 6 concise, high-yield points that frequently appear in exams.
3. "examples": 2 to 3 practical, relatable examples (real-world Indian context or standard textbook problems).
4. "quickRevision": 4 to 5 bullet points for last-minute exam revision (formulas, rules, mnemonics, or summary tips).

Format strictly as JSON matching:
{
  "title": "Clear Chapter / Notes Title",
  "topic": "${topic}",
  "subject": "${subject}",
  "classLevel": ${classLevel},
  "language": "${language}",
  "importantDefinitions": [
    { "term": "Term Name", "definition": "Explanation..." }
  ],
  "keyPoints": ["Point 1...", "Point 2..."],
  "examples": ["Example 1...", "Example 2..."],
  "quickRevision": ["Revision point 1...", "Revision point 2..."]
}
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        topic: { type: Type.STRING },
        subject: { type: Type.STRING },
        classLevel: { type: Type.NUMBER },
        language: { type: Type.STRING },
        importantDefinitions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING },
            },
            required: ['term', 'definition'],
          },
        },
        keyPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        examples: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        quickRevision: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['title', 'topic', 'subject', 'classLevel', 'language', 'importantDefinitions', 'keyPoints', 'examples', 'quickRevision'],
    };

    const parsed = await generateWithFallback(ai, { prompt, schema });
    parsed.id = `notes_${Date.now()}`;
    parsed.timestamp = Date.now();
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/notes:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate study notes. Please try again.',
    });
  }
});

export default app;
