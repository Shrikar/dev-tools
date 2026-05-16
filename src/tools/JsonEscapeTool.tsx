import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { escapedJavaStringToPrettyJson, jsonToEscapedJavaString } from '../utils/stringEscapeUtils'
import './tool-shell.css'

export default function JsonEscapeTool() {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const runAction = (transform: (value: string) => string) => {
    setError('')
    try {
      setText(transform(text))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleCopy = async () => {
    if (!text || !navigator.clipboard) return
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>JSON Escape / Unescape</h1>
      <p>Single-editor workflow. Transform in place between raw JSON and escaped JSON string.</p>
      <section className="tool-card">
        <MonacoTextEditor value={text} onChange={setText} height="76vh" language="json" />
        <div className="tool-actions">
          <button className="tool-button" onClick={() => runAction(jsonToEscapedJavaString)}>Escape JSON</button>
          <button className="tool-button secondary" onClick={() => runAction(escapedJavaStringToPrettyJson)}>Unescape to JSON</button>
          <button className="tool-button secondary" onClick={handleCopy}>Copy</button>
        </div>
        {error && <div style={{ color: '#fda4af', marginTop: 10 }}>{error}</div>}
      </section>
    </div>
  )
}
