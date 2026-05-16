import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import CollapsibleDataView from '../components/json/CollapsibleDataView'
import { composePath, resolveJsonPath } from '../utils/jsonPathUtils'
import { formatJSON, validateJSON } from '../utils/jsonUtils'
import './tool-shell.css'

type JsonLike = null | boolean | number | string | JsonLike[] | { [key: string]: JsonLike }

interface TreeNodeProps {
  value: JsonLike
  path: string[]
  onSelectPath: (path: string) => void
}

function renderValuePreview(value: JsonLike): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `Array(${value.length})`
  if (typeof value === 'object') return 'Object'
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

function TreeNode({ value, path, onSelectPath }: TreeNodeProps) {
  if (value === null || typeof value !== 'object') {
    return <span style={{ color: '#cbd5e1' }}>{renderValuePreview(value)}</span>
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value)

  return (
    <ul style={{ listStyle: 'none', margin: 0, paddingLeft: 14 }}>
      {entries.map(([key, child]) => {
        const childPathParts = [...path, key]
        const composedPath = composePath(childPathParts, null)
        const isExpandable = child !== null && typeof child === 'object'

        return (
          <li key={composedPath} style={{ margin: '5px 0' }}>
            <button
              type="button"
              onClick={() => onSelectPath(composedPath)}
              style={{
                border: '1px solid #334155',
                background: '#0b1120',
                color: '#e2e8f0',
                borderRadius: 8,
                padding: '3px 8px',
                cursor: 'pointer',
                marginRight: 8,
                fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
              }}
            >
              {Array.isArray(value) ? `[${key}]` : key}
            </button>
            {!isExpandable ? (
              <span style={{ color: '#94a3b8' }}>{renderValuePreview(child)}</span>
            ) : (
              <TreeNode value={child as JsonLike} path={childPathParts} onSelectPath={onSelectPath} />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default function JSONPathTool() {
  const [input, setInput] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [pathInput, setPathInput] = useState('')
  const [pathResult, setPathResult] = useState('')
  const [pathError, setPathError] = useState('')

  const parsed = useMemo(() => {
    try {
      return { value: validateJSON(input) as JsonLike, error: '' }
    } catch (error) {
      return { value: null as JsonLike, error: (error as Error).message }
    }
  }, [input])

  const handleResolve = () => {
    setPathError('')
    if (parsed.value === null && input.trim() !== 'null') {
      setPathResult('')
      setPathError('Enter valid JSON first.')
      return
    }

    try {
      const result = resolveJsonPath(parsed.value, pathInput)
      setPathResult(formatJSON(result))
    } catch (error) {
      setPathResult('')
      setPathError((error as Error).message)
    }
  }

  return (
    <div className="tool-shell">
      <h1>JSON Path Explorer</h1>
      <p>Click any JSON node to capture its path. Enter a path to resolve matching data.</p>

      <section className="tool-card">
        <MonacoTextEditor value={input} onChange={setInput} height="320px" language="json" />
        {parsed.error && <div style={{ marginTop: 10, color: '#fda4af' }}>{parsed.error}</div>}
      </section>

      <section className="tool-card">
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ fontSize: 13, color: '#a5b4fc' }}>Selected path</label>
          <MonacoTextEditor value={selectedPath} readOnly height="74px" language="plaintext" />
        </div>
      </section>

      <section className="tool-card">
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ fontSize: 13, color: '#a5b4fc' }}>Path input (example: user.addresses[0].city)</label>
          <MonacoTextEditor value={pathInput} onChange={setPathInput} height="74px" language="plaintext" />
          <div className="tool-actions">
            <button className="tool-button" onClick={handleResolve}>
              Resolve Path
            </button>
            <button className="tool-button secondary" onClick={() => setPathInput(selectedPath)}>
              Use selected path
            </button>
          </div>
          {pathError && <div style={{ color: '#fda4af' }}>{pathError}</div>}
          {pathResult && <MonacoTextEditor value={pathResult} readOnly height="180px" language="json" />}
          {pathResult && <CollapsibleDataView input={pathResult} mode="json" />}
        </div>
      </section>

      <section className="tool-card">
        <div style={{ fontSize: 13, color: '#93c5fd', marginBottom: 8 }}>Click keys/indices below to capture path:</div>
        {parsed.error ? (
          <div style={{ color: '#94a3b8' }}>Valid JSON is required to render the tree.</div>
        ) : (
          <TreeNode
            value={parsed.value}
            path={[]}
            onSelectPath={(path) => {
              setSelectedPath(path)
            }}
          />
        )}
      </section>
    </div>
  )
}
