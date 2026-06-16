const BASE_URL = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  health: () => request('/health'),
  similarity: {
    compare: (text_a, text_b) =>
      request('/similarity/compare', {
        method: 'POST',
        body: JSON.stringify({ text_a, text_b }),
      }),
  },
}
