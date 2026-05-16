import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import BraceColoredJson from '../components/json/BraceColoredJson'
import CollapsibleDataView from '../components/json/CollapsibleDataView'
import { formatJSON, minifyJSON, sortJSONKeys, validateJSON } from '../utils/jsonUtils'
import './tool-shell.css'

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const runTransform = (transform: (value: unknown) => string) => {
    setError(null)
    try {
      const parsed = validateJSON(input)
      setOutput(transform(parsed))
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  return (
    <div className="tool-shell">
      <h1>JSON Formatter</h1>
      <p>Validate and transform JSON with format, minify, and sorted-key output.</p>
      <div className="tool-grid">
        <section className="tool-card">
          <MonacoTextEditor value={input} onChange={setInput} height="420px" language="json" />
          <div className="tool-actions">
            <button className="tool-button" onClick={() => runTransform(formatJSON)}>
              Format
            </button>
            <button className="tool-button secondary" onClick={() => runTransform(minifyJSON)}>
              Minify
            </button>
            <button className="tool-button secondary" onClick={() => runTransform((value) => formatJSON(sortJSONKeys(value)))}>
              Sort Keys
            </button>
          </div>
        </section>
        <section>
          <div className="tool-card">{error ? <div style={{ color: '#fda4af' }}>{error}</div> : <BraceColoredJson jsonText={output} />}</div>
          <CollapsibleDataView input={output} mode="json" />
        </section>
      </div>
    </div>
  )
}
