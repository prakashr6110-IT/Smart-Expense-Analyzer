import { chatWithOllama } from '../../server/ollama.js';

/**
 * Production serverless version of the dev-only /api/ollama/chat route that
 * vite.config.js registers on the Vite dev server. Vercel deploys anything in
 * /api as a function, so the browser can keep calling the same URL and the
 * OLLAMA_API_KEY stays server-side.
 */
export const runtime = 'nodejs20.x';
export const maxDuration = 60;

const MAX_MESSAGES = 12;
const MAX_CONTENT = 4000;

/**
 * Read the JSON body whether or not the runtime already parsed it.
 * @param {object} req - incoming request
 * @returns {Promise<object>} parsed body ({} when empty or malformed)
 */
async function readBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }

  let raw = '';
  if (typeof req[Symbol.asyncIterator] === 'function') {
    for await (const chunk of req) raw += chunk;
  }
  if (!raw) return req.body && typeof req.body === 'object' ? req.body : {};
  try {
    return JSON.parse(raw);
  } catch {
    return null; // signals malformed JSON
  }
}

/** Keep the prompt bounded so long chats can't blow up the request. */
const sanitizeMessages = (messages) =>
  messages
    .filter((m) => m && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: typeof m.role === 'string' && m.role.trim() ? m.role.trim() : 'user',
      content: m.content.slice(0, MAX_CONTENT),
    }));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);
  if (!body) {
    res.status(400).json({ error: 'Request body must be valid JSON' });
    return;
  }

  const { messages, model } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'No question was sent to the assistant' });
    return;
  }

  try {
    const result = await chatWithOllama(sanitizeMessages(messages), { model });
    res.status(200).json(result);
  } catch (err) {
    const status = err.status_code || err.response?.status || 500;
    console.error('Ollama chat failed:', err.message);
    res.status(status === 200 ? 500 : status).json({ error: err.message });
  }
}
