// Browser-side helper. It talks to our own server route (/api/ollama/chat),
// which then calls Ollama. The API key stays on the server and is never used here.

/**
 * Ask the Ollama-connected assistant a question.
 * @param {Array<{role: string, content: string}> | string} messages
 * @param {{model?: string}} [options]
 * @returns {Promise<string>} the assistant's reply text
 */
export async function askOllama(messages, options = {}) {
  const payload = Array.isArray(messages) ? messages : [{ role: 'user', content: messages }]

  const res = await fetch('/api/ollama/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: payload, model: options.model }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Request failed with status ${res.status}`)
  }

  const data = await res.json()
  return data?.message?.content ?? ''
}
