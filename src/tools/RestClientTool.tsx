import { useEffect, useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import CollapsibleDataView from '../components/json/CollapsibleDataView'
import { formatHttpRequest, parseHttpRequest } from '../utils/httpRequestUtils'
import './tool-shell.css'

const STORAGE_KEY = 'devtools.restClient.requests'
const SAMPLE_REQUEST = `GET https://jsonplaceholder.typicode.com/todos/1\nAccept: application/json\n`

interface SavedRequest {
  id: string
  name: string
  raw: string
  updatedAt: number
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function createRequest(name = 'New Request', raw = SAMPLE_REQUEST): SavedRequest {
  return {
    id: crypto.randomUUID(),
    name,
    raw,
    updatedAt: Date.now(),
  }
}

function loadRequests(): SavedRequest[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [createRequest('Sample Request')]
    const parsed = JSON.parse(raw) as SavedRequest[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [createRequest('Sample Request')]
    return parsed
  } catch {
    return [createRequest('Sample Request')]
  }
}

export default function RestClientTool() {
  const [requests, setRequests] = useState<SavedRequest[]>(() => loadRequests())
  const [selectedId, setSelectedId] = useState(() => loadRequests()[0].id)
  const [statusLine, setStatusLine] = useState('No request sent yet.')
  const [responseHeaders, setResponseHeaders] = useState('')
  const [responseBody, setResponseBody] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (requests.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    }
  }, [requests])

  const selected = useMemo(() => requests.find((item) => item.id === selectedId) ?? null, [requests, selectedId])
  const rawRequest = selected?.raw ?? ''


  const responseMode = useMemo(() => {
    const trimmed = responseBody.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json' as const
    if (trimmed.includes(':')) return 'yaml' as const
    return null
  }, [responseBody])

  const parsedPreview = useMemo(() => {
    try {
      const parsed = parseHttpRequest(rawRequest)
      return `${parsed.method} ${parsed.url}`
    } catch {
      return 'Invalid request format'
    }
  }, [rawRequest])

  const updateSelected = (updater: (request: SavedRequest) => SavedRequest) => {
    setRequests((prev) => prev.map((item) => (item.id === selectedId ? updater(item) : item)))
  }

  const sendRequest = async () => {
    if (!selected) return
    setError('')
    setIsLoading(true)

    try {
      const parsed = parseHttpRequest(selected.raw)

      const response = await fetch(parsed.url, {
        method: parsed.method,
        headers: parsed.headers,
        body: parsed.body ? parsed.body : undefined,
      })

      const responseText = await response.text()
      const headerLines: string[] = []
      response.headers.forEach((value, name) => {
        headerLines.push(`${name}: ${value}`)
      })

      setStatusLine(`HTTP ${response.status} ${response.statusText}`)
      setResponseHeaders(headerLines.join('\n'))
      setResponseBody(responseText)
    } catch (err) {
      setError((err as Error).message || 'Request failed')
      setStatusLine('Request failed')
      setResponseHeaders('')
      setResponseBody('')
    } finally {
      setIsLoading(false)
    }
  }

  const exportRequest = () => {
    if (!selected) return
    try {
      const parsed = parseHttpRequest(selected.raw)
      const formatted = formatHttpRequest(parsed)
      downloadTextFile(`${selected.name.replace(/\s+/g, '-').toLowerCase()}.http`, formatted)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const exportResponse = () => {
    const combined = `${statusLine}\n${responseHeaders ? `${responseHeaders}\n` : ''}\n${responseBody}`
    downloadTextFile('response.http', combined)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selected) return

    try {
      const content = await file.text()
      updateSelected((item) => ({ ...item, raw: content, updatedAt: Date.now() }))
      setError('')
    } catch {
      setError('Unable to read file.')
    }
  }

  const addRequest = () => {
    const request = createRequest(`Request ${requests.length + 1}`)
    setRequests((prev) => [request, ...prev])
    setSelectedId(request.id)
  }

  const duplicateRequest = () => {
    if (!selected) return
    const request = createRequest(`${selected.name} Copy`, selected.raw)
    setRequests((prev) => [request, ...prev])
    setSelectedId(request.id)
  }

  const deleteRequest = () => {
    if (!selected) return
    const next = requests.filter((item) => item.id !== selected.id)
    if (next.length === 0) {
      const fallback = createRequest('Sample Request')
      setRequests([fallback])
      setSelectedId(fallback.id)
      return
    }
    setRequests(next)
    setSelectedId(next[0].id)
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>REST Client</h1>
      <p>HTTPie-style browser-only client. Save multiple requests locally, run with fetch, and import/export `.http` files.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        <section className="tool-card" style={{ display: 'grid', gap: 10, alignContent: 'start', maxHeight: '760px' }}>
          <div className="tool-actions" style={{ marginTop: 0 }}>
            <button className="tool-button" onClick={addRequest}>New</button>
            <button className="tool-button secondary" onClick={duplicateRequest} disabled={!selected}>Duplicate</button>
            <button className="tool-button secondary" onClick={deleteRequest} disabled={!selected}>Delete</button>
          </div>

          <div style={{ display: 'grid', gap: 8, overflow: 'auto' }}>
            {requests.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                style={{
                  textAlign: 'left',
                  border: item.id === selectedId ? '1px solid #60a5fa' : '1px solid #334155',
                  background: item.id === selectedId ? '#0b1f38' : '#111827',
                  color: '#e2e8f0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(item.updatedAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </section>

        <div style={{ display: 'grid', gap: 16 }}>
          <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
            <input
              className="tool-input"
              value={selected?.name ?? ''}
              onChange={(event) => selected && updateSelected((item) => ({ ...item, name: event.target.value, updatedAt: Date.now() }))}
              placeholder="Request name"
            />
            <div style={{ color: '#93c5fd', fontSize: 13 }}>Request preview: {parsedPreview}</div>
            <MonacoTextEditor
              value={rawRequest}
              onChange={(next) => selected && updateSelected((item) => ({ ...item, raw: next, updatedAt: Date.now() }))}
              height="72vh"
              language="plaintext"
            />

            <div className="tool-actions">
              <button className="tool-button" onClick={sendRequest} disabled={isLoading || !selected}>
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button className="tool-button secondary" onClick={exportRequest} disabled={!selected}>
                Download .http
              </button>
              <label className="tool-button secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Upload .http
                <input type="file" accept=".http,.txt" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
          </section>

          <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
            <div style={{ color: '#cbd5e1' }}>{statusLine}</div>
            {error && <div style={{ color: '#fda4af' }}>{error}</div>}
            <MonacoTextEditor value={responseHeaders} readOnly height="120px" language="plaintext" />
            <MonacoTextEditor value={responseBody} readOnly height="42vh" language="plaintext" />
            {responseMode && <CollapsibleDataView input={responseBody} mode={responseMode} />}
            <div className="tool-actions">
              <button className="tool-button secondary" onClick={exportResponse}>
                Download Response
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
