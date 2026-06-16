import { useState } from 'react'
import { api } from './services/api'
import './App.css'

function App() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCompare() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.similarity.compare(textA, textB)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>Similitud de textos</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <textarea
          rows={4}
          placeholder="Texto A"
          value={textA}
          onChange={(e) => setTextA(e.target.value)}
          style={{ padding: 8, fontSize: 14 }}
        />
        <textarea
          rows={4}
          placeholder="Texto B"
          value={textB}
          onChange={(e) => setTextB(e.target.value)}
          style={{ padding: 8, fontSize: 14 }}
        />
        <button onClick={handleCompare} disabled={loading || !textA || !textB}>
          {loading ? 'Calculando...' : 'Comparar'}
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: 16 }}>Error: {error}</p>}

      {result && (
        <div style={{ marginTop: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
          <p><strong>Score:</strong> {result.score}</p>
          <p><strong>Método:</strong> {result.method}</p>
        </div>
      )}
    </div>
  )
}

export default App
