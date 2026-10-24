import { Ollama } from 'ollama';

// Server-side only. This module reads the API key from the environment and is
// never imported by browser code, so the key is never shipped to the client.
const OLLAMA_HOST = 'https://ollama.com';
const DEFAULT_MODEL = 'gemma4:31b';

/**
 * Send a chat request to Ollama's cloud API.
 * @param {Array<{role: string, content: string}>} messages - chat messages
 * @param {{model?: string}} [options]
 * @returns {Promise<object>} the raw Ollama chat response (response.message.content holds the reply)
 */
export async function chatWithOllama(messages, options = {}) {
  const model = options.model || DEFAULT_MODEL;
  const apiKey = process.env.OLLAMA_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OLLAMA_API_KEY is not set. Add it to your .env file (server-side only).'
    );
  }

  const client = new Ollama({
    host: OLLAMA_HOST,
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  return client.chat({
    model,
    messages,
    stream: false,
  });
}
