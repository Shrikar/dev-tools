import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { formatHttpRequest, parseHttpRequest } from '../utils/httpRequestUtils'
import './tool-shell.css'

const SAMPLE_REQUEST = `GET https://jsonplaceholder.typicode.com/todos/1\nAccept: application/json\n`

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function RestClientTool() {
  const [rawRequest, setRawRequest] = useState(SAMPLE_REQUEST)
  const [statusLine, setStatusLine] = useState('No request sent yet.')
  const [responseHeaders, setResponseHeaders] = useState('')
  const [responseBody, setResponseBody] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const parsedPreview = useMemo(() => {
    try {
      const parsed = parseHttpRequest(rawRequest)
      return `${parsed.method} ${parsed.url}`
    } catch {
      return 'Invalid request format'
    }
  }, [rawRequest])

  const sendRequest = async () => {
    setError('')
    setIsLoading(true)

    try {
      const parsed = parseHttpRequest(rawRequest)

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
    try {
      const parsed = parseHttpRequest(rawRequest)
      const formatted = formatHttpRequest(parsed)
      downloadTextFile('request.http', formatted)
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
    if (!file) return

    try {
      const content = await file.text()
      setRawRequest(content)
      setError('')
    } catch {
      setError('Unable to read file.')
    }
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>REST Client</h1>
      <p>
        Browser-only HTTP client using fetch. You can import/export `.http` request files and export responses. Some APIs may block browser requests due to CORS.
      </p>

      <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
        <div style={{ color: '#93c5fd', fontSize: 13 }}>Request preview: {parsedPreview}</div>
        <MonacoTextEditor value={rawRequest} onChange={setRawRequest} height="320px" language="plaintext" />

        <div className="tool-actions">
          <button className="tool-button" onClick={sendRequest} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Request'}
          </button>
          <button className="tool-button secondary" onClick={exportRequest}>
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
        <MonacoTextEditor value={responseBody} readOnly height="260px" language="plaintext" />
        <div className="tool-actions">
          <button className="tool-button secondary" onClick={exportResponse}>
            Download Response
          </button>
        </div>
      </section>
    </div>
  )
}
