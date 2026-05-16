import { useMemo, useState } from 'react'
import ReactJson from 'react-json-view'
import { composePath, resolveJsonPath } from '../utils/jsonPathUtils'
import { formatJSON, validateJSON } from '../utils/jsonUtils'
import './tool-shell.css'

export default function JSONPathTool() {
  const [input, setInput] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [pathInput, setPathInput] = useState('')
  const [pathResult, setPathResult] = useState('')
  const [pathError, setPathError] = useState('')

  const parsed = useMemo(() => {
    try {
      return { value: validateJSON(input), error: '' }
    } catch (error) {
      return { value: null, error: (error as Error).message }
    }
  }, [input])

  const handleResolve = () => {
    setPathError('')
    if (!parsed.value) {
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
        <textarea
          className="tool-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste JSON"
          rows={12}
        />
        {parsed.error && <div style={{ marginTop: 10, color: '#fda4af' }}>{parsed.error}</div>}
      </section>

      <section className="tool-card">
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ fontSize: 13, color: '#a5b4fc' }}>Selected path</label>
          <input className="tool-input" value={selectedPath} readOnly placeholder="Click a node in the JSON viewer" />
        </div>
      </section>

      <section className="tool-card">
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ fontSize: 13, color: '#a5b4fc' }}>Path input (example: user.addresses[0].city)</label>
          <input className="tool-input" value={pathInput} onChange={(event) => setPathInput(event.target.value)} />
          <div className="tool-actions">
            <button className="tool-button" onClick={handleResolve}>
              Resolve Path
            </button>
            <button className="tool-button secondary" onClick={() => setPathInput(selectedPath)}>
              Use selected path
            </button>
          </div>
          {pathError && <div style={{ color: '#fda4af' }}>{pathError}</div>}
          {pathResult && <pre className="tool-output">{pathResult}</pre>}
        </div>
      </section>

      <section className="tool-card">
        {parsed.value && (
          <ReactJson
            src={parsed.value}
            name={null}
            collapsed={2}
            enableClipboard
            displayDataTypes={false}
            theme="ocean"
            onSelect={(selection) => {
              const path = composePath(selection.namespace.filter((item): item is string => item !== null), selection.name)
              setSelectedPath(path)
            }}
          />
        )}
      </section>
    </div>
  )
}
