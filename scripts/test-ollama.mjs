// Manual test for the Ollama cloud connection.
// Runs the SAME server code path the app uses (server/ollama.js -> chatWithOllama).
//
//   node --env-file=.env scripts/test-ollama.mjs
//
// Requires OLLAMA_API_KEY to be present in .env (or the shell environment).
import { chatWithOllama } from '../server/ollama.js'

const messages = [
  { role: 'user', content: 'In one sentence, what is a smart expense analyzer?' },
]

try {
  const response = await chatWithOllama(messages)
  console.log('Model:', response.model)
  console.log('Reply:', response.message?.content)
} catch (err) {
  console.error('Ollama request failed:', err.message)
  process.exitCode = 1
}
