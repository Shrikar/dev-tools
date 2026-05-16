import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { md5, sha256, sha512 } from '../utils/hashUtils'
import './tool-shell.css'

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [algo, setAlgo] = useState('sha256')
  const [out, setOut] = useState('')

  function generate() {
    if (algo === 'sha256') setOut(sha256(input))
    else if (algo === 'sha512') setOut(sha512(input))
    else setOut(md5(input))
  }

  return (
    <div className="tool-shell">
      <h1>Hash Generator</h1>
      <div className="tool-card">
        <MonacoTextEditor value={input} onChange={setInput} height="220px" language="plaintext" />
        <div className="tool-actions">
          <select className="tool-select" value={algo} onChange={(e) => setAlgo(e.target.value)} style={{ maxWidth: 170 }}>
            <option value="sha256">SHA-256</option>
            <option value="sha512">SHA-512</option>
            <option value="md5">MD5</option>
          </select>
          <button className="tool-button" onClick={generate}>
            Generate
          </button>
        </div>
      </div>
      <div className="tool-card">
        <MonacoTextEditor value={out} readOnly height="180px" language="plaintext" />
      </div>
    </div>
  )
}
