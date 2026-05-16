import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { escapedJavaStringToPrettyJson, jsonToEscapedJavaString } from '../utils/stringEscapeUtils'
import './tool-shell.css'

export default function JsonEscapeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const runAction = (transform: (value: string) => string) => {
    setError('')
    try {
      setOutput(transform(input))
    } catch (err) {
      setOutput('')
      setError((err as Error).message)
    }
  }

  const handleCopy = async () => {
    if (!output || !navigator.clipboard) return
    await navigator.clipboard.writeText(output)
  }

  return (
    <div className="tool-shell">
      <h1>JSON Escape / Unescape</h1>
      <p>Convert between raw JSON and Java-style escaped string literals.</p>
      <div className="tool-grid">
        <section className="tool-card">
          <MonacoTextEditor value={input} onChange={setInput} height="380px" language="json" />
          <div className="tool-actions">
            <button className="tool-button" onClick={() => runAction(jsonToEscapedJavaString)}>
              Escape JSON
            </button>
            <button className="tool-button secondary" onClick={() => runAction(escapedJavaStringToPrettyJson)}>
              Unescape to JSON
            </button>
          </div>
          {error && <div style={{ color: '#fda4af', marginTop: 10 }}>{error}</div>}
        </section>
        <section className="tool-card">
          <MonacoTextEditor value={output} readOnly height="380px" language="json" />
          <div className="tool-actions">
            <button className="tool-button secondary" onClick={handleCopy}>
              Copy Output
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
