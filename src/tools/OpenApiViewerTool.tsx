import { useMemo, useState } from 'react'
import { parse as parseYaml } from 'yaml'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

type OpenApiPathItem = Record<string, { operationId?: string; summary?: string }>

function parseOpenApi(input: string): any {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Paste an OpenAPI JSON/YAML document.')
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed)
  return parseYaml(trimmed)
}

const SAMPLE = `openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /users:
    get:
      summary: List users
    post:
      summary: Create user
  /users/{id}:
    get:
      summary: Get user by ID
`

export default function OpenApiViewerTool() {
  const [specText, setSpecText] = useState(SAMPLE)
  const [selectedServer, setSelectedServer] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('get')

  const parsed = useMemo(() => {
    try {
      const api = parseOpenApi(specText)
      return { api, error: '' }
    } catch (err) {
      return { api: null, error: (err as Error).message }
    }
  }, [specText])

  const servers = (parsed.api?.servers ?? []).map((server: { url?: string }) => server.url).filter(Boolean) as string[]
  const paths = Object.keys(parsed.api?.paths ?? {})

  const operations = useMemo(() => {
    if (!parsed.api || !selectedPath) return [] as string[]
    const pathItem: OpenApiPathItem = parsed.api.paths?.[selectedPath] ?? {}
    return Object.keys(pathItem)
      .filter((method) => ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method))
      .map((method) => method.toLowerCase())
  }, [parsed.api, selectedPath])

  const chosenServer = selectedServer || servers[0] || ''
  const chosenPath = selectedPath || paths[0] || ''
  const chosenMethod = operations.includes(selectedMethod) ? selectedMethod : operations[0] || 'get'

  const operationSummary = useMemo(() => {
    if (!parsed.api || !chosenPath) return ''
    const op = parsed.api.paths?.[chosenPath]?.[chosenMethod] ?? {}
    return op.summary || op.operationId || ''
  }, [parsed.api, chosenPath, chosenMethod])

  let generatedRequest = ''
  if (chosenServer && chosenPath) {
    const fullUrl = `${chosenServer.replace(/\/$/, '')}${chosenPath}`
    generatedRequest = `fetch(${JSON.stringify(fullUrl)}, {\n  method: '${chosenMethod.toUpperCase()}',\n  headers: {\n    'Content-Type': 'application/json'\n  }\n})\n  .then((response) => response.json())\n  .then((data) => console.log(data))\n  .catch((error) => console.error(error));`
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h2>OpenAPI Viewer + Request Generator</h2>
      <p>Paste OpenAPI YAML/JSON, inspect paths, and generate starter fetch requests.</p>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">OpenAPI spec (YAML or JSON)</label>
          <MonacoTextEditor value={specText} onChange={setSpecText} height="62vh" language="yaml" />
          {parsed.error && <div style={{ color: '#fda4af', marginTop: 10 }}>{parsed.error}</div>}
        </section>

        <section style={{ display: 'grid', gap: 12 }}>
          <div className="tool-card" style={{ display: 'grid', gap: 10 }}>
            <label className="tool-label">Server</label>
            <select className="tool-input" value={chosenServer} onChange={(event) => setSelectedServer(event.target.value)}>
              {servers.length === 0 && <option value="">No server found</option>}
              {servers.map((server) => <option key={server} value={server}>{server}</option>)}
            </select>

            <label className="tool-label">Path</label>
            <select className="tool-input" value={chosenPath} onChange={(event) => setSelectedPath(event.target.value)}>
              {paths.length === 0 && <option value="">No path found</option>}
              {paths.map((path) => <option key={path} value={path}>{path}</option>)}
            </select>

            <label className="tool-label">Method</label>
            <select className="tool-input" value={chosenMethod} onChange={(event) => setSelectedMethod(event.target.value)}>
              {operations.length === 0 && <option value="get">GET</option>}
              {operations.map((method) => <option key={method} value={method}>{method.toUpperCase()}</option>)}
            </select>

            <div style={{ color: '#93c5fd', fontSize: 13 }}>{operationSummary || 'No operation summary available.'}</div>
          </div>

          <div className="tool-card">
            <label className="tool-label">Generated request</label>
            <MonacoTextEditor value={generatedRequest} readOnly height="34vh" language="javascript" />
          </div>
        </section>
      </div>
    </div>
  )
}
