import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { urlDecode, urlEncode } from '../utils/urlUtils'
import './tool-shell.css'

export default function URLEncodeDecode() {
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')

  return (
    <div className="tool-shell">
      <h1>URL Encode / Decode</h1>
      <div className="tool-card">
        <MonacoTextEditor value={input} onChange={setInput} height="220px" language="plaintext" />
        <div className="tool-actions">
          <button className="tool-button" onClick={() => setOut(urlEncode(input))}>
            Encode
          </button>
          <button className="tool-button secondary" onClick={() => setOut(urlDecode(input))}>
            Decode
          </button>
        </div>
      </div>
      <div className="tool-card">
        <MonacoTextEditor value={out} readOnly height="220px" language="plaintext" />
      </div>
    </div>
  )
}
