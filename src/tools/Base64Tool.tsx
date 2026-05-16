import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { base64Decode, base64Encode } from '../utils/base64'
import './tool-shell.css'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  return (
    <div className="tool-shell">
      <h1>Base64 Encode / Decode</h1>
      <div className="tool-card">
        <MonacoTextEditor value={input} onChange={setInput} height="220px" language="plaintext" />
        <div className="tool-actions">
          <button className="tool-button" onClick={() => setOutput(base64Encode(input))}>
            Encode
          </button>
          <button className="tool-button secondary" onClick={() => setOutput(base64Decode(input))}>
            Decode
          </button>
        </div>
      </div>
      <div className="tool-card">
        <MonacoTextEditor value={output} readOnly height="220px" language="plaintext" />
      </div>
    </div>
  )
}
