import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { base64Decode, base64Encode } from '../utils/base64'
import './tool-shell.css'

export default function Base64Tool() {
  const [plainText, setPlainText] = useState('')
  const [base64Text, setBase64Text] = useState('')

  const handleEncode = () => {
    setBase64Text(base64Encode(plainText))
  }

  const handleDecode = () => {
    setPlainText(base64Decode(base64Text))
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>Base64 Encode / Decode</h1>
      <div className="tool-grid">
        <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
          <label style={{ color: '#93c5fd', fontSize: 13 }}>Plain text</label>
          <MonacoTextEditor value={plainText} onChange={setPlainText} height="72vh" language="plaintext" />
          <div className="tool-actions" style={{ marginTop: 0 }}>
            <button className="tool-button" onClick={handleEncode}>Encode</button>
          </div>
        </section>

        <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
          <label style={{ color: '#93c5fd', fontSize: 13 }}>Base64 encoded</label>
          <MonacoTextEditor value={base64Text} onChange={setBase64Text} height="72vh" language="plaintext" />
          <div className="tool-actions" style={{ marginTop: 0 }}>
            <button className="tool-button secondary" onClick={handleDecode}>Decode</button>
          </div>
        </section>
      </div>
    </div>
  )
}
