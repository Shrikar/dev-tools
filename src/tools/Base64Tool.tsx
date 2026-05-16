import { useState } from 'react'
import { base64Decode, base64Encode } from '../utils/base64'
import './tool-shell.css'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  return (
    <div className="tool-shell">
      <h1>Base64 Encode / Decode</h1>
      <div className="tool-card">
        <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} rows={8} />
        <div className="tool-actions">
          <button className="tool-button" onClick={() => setOutput(base64Encode(input))}>
            Encode
          </button>
          <button className="tool-button secondary" onClick={() => setOutput(base64Decode(input))}>
            Decode
          </button>
        </div>
      </div>
      <pre className="tool-output tool-card">{output}</pre>
    </div>
  )
}
