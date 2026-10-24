import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { chatWithOllama } from './server/ollama.js'

// Dev-server route: the browser calls POST /api/ollama/chat, and this server-side
// handler talks to Ollama using OLLAMA_API_KEY. The key never reaches the client.
function ollamaChatRoute() {
  return {
    name: 'ollama-chat-route',
    configureServer(server) {
      server.middlewares.use('/api/ollama/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let raw = ''
        req.on('data', (chunk) => (raw += chunk))
        req.on('end', async () => {
          try {
            const { messages = [], model } = raw ? JSON.parse(raw) : {}
            const result = await chatWithOllama(messages, { model })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          } catch (err) {
            const statusCode = err.status_code || err.response?.status || 500
            res.statusCode = statusCode
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load ALL env vars (empty prefix) so server code can read OLLAMA_API_KEY.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.OLLAMA_API_KEY && !process.env.OLLAMA_API_KEY) {
    process.env.OLLAMA_API_KEY = env.OLLAMA_API_KEY
  }

  return {
    plugins: [react(), ollamaChatRoute()],
  }
})
