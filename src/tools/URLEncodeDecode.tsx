import { useState } from 'react'
import { urlDecode, urlEncode } from '../utils/urlUtils'
import './tool-shell.css'

export default function URLEncodeDecode() {
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')

  return (
    <div className="tool-shell">
      <h1>URL Encode / Decode</h1>
      <div className="tool-card">
        <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} rows={6} />
        <div className="tool-actions">
          <button className="tool-button" onClick={() => setOut(urlEncode(input))}>
            Encode
          </button>
          <button className="tool-button secondary" onClick={() => setOut(urlDecode(input))}>
            Decode
          </button>
        </div>
      </div>
      <pre className="tool-output tool-card">{out}</pre>
    </div>
  )
}
