import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import CollapsibleDataView from '../components/json/CollapsibleDataView'
import { formatJSON, minifyJSON, sortJSONKeys, validateJSON } from '../utils/jsonUtils'
import './tool-shell.css'

export default function JSONFormatter() {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const runTransform = (transform: (value: unknown) => string) => {
    setError(null)
    try {
      const parsed = validateJSON(text)
      setText(transform(parsed))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>JSON Formatter</h1>
      <p>Single-editor workflow for format, minify, and sorted-key output.</p>
      <section className="tool-card">
        <MonacoTextEditor value={text} onChange={setText} height="76vh" language="json" />
        <div className="tool-actions">
          <button className="tool-button" onClick={() => runTransform(formatJSON)}>Format</button>
          <button className="tool-button secondary" onClick={() => runTransform(minifyJSON)}>Minify</button>
          <button className="tool-button secondary" onClick={() => runTransform((value) => formatJSON(sortJSONKeys(value)))}>Sort Keys</button>
        </div>
        {error && <div style={{ color: '#fda4af', marginTop: 10 }}>{error}</div>}
      </section>
      <CollapsibleDataView input={text} mode="json" />
    </div>
  )
}
