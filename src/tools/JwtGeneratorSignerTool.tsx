import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import { normalizeBase64Url } from '../utils/jwtDecoderUtils'
import './tool-shell.css'

function base64UrlEncodeText(input: string) {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlEncodeBuffer(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export default function JwtGeneratorSignerTool() {
  const [headerText, setHeaderText] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [payloadText, setPayloadText] = useState('{\n  "sub": "user-123",\n  "role": "admin"\n}')
  const [secret, setSecret] = useState('my-secret')
  const [secretIsBase64Url, setSecretIsBase64Url] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const alg = useMemo(() => {
    try {
      const parsed = JSON.parse(headerText)
      return typeof parsed.alg === 'string' ? parsed.alg : ''
    } catch {
      return ''
    }
  }, [headerText])

  const generate = async () => {
    setError('')
    try {
      const header = JSON.parse(headerText)
      const payload = JSON.parse(payloadText)

      if (header.alg !== 'HS256') {
        throw new Error('Only HS256 is supported in browser signing currently.')
      }

      if (!secret) {
        throw new Error('Secret is required for HS256 signing.')
      }

      const headerPart = base64UrlEncodeText(JSON.stringify(header))
      const payloadPart = base64UrlEncodeText(JSON.stringify(payload))
      const signingInput = `${headerPart}.${payloadPart}`

      const rawSecret = secretIsBase64Url
        ? Uint8Array.from(atob(normalizeBase64Url(secret)), (ch) => ch.charCodeAt(0))
        : new TextEncoder().encode(secret)

      const cryptoKey = await crypto.subtle.importKey('raw', rawSecret as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signingInput))
      const signaturePart = base64UrlEncodeBuffer(signatureBuffer)

      setToken(`${signingInput}.${signaturePart}`)
    } catch (err) {
      setToken('')
      setError((err as Error).message)
    }
  }

  return (
    <div className="tool-shell">
      <h1>JWT Generator / Signer</h1>
      <p>Generate HS256 JWTs locally in the browser using custom header, payload, and secret.</p>

      <div className="tool-grid">
        <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
          <label style={{ color: '#93c5fd', fontSize: 13 }}>Header JSON</label>
          <MonacoTextEditor value={headerText} onChange={setHeaderText} height="150px" language="json" />
          <label style={{ color: '#93c5fd', fontSize: 13 }}>Payload JSON</label>
          <MonacoTextEditor value={payloadText} onChange={setPayloadText} height="200px" language="json" />
        </section>

        <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
          <label style={{ color: '#93c5fd', fontSize: 13 }}>Secret ({alg || 'unknown alg'})</label>
          <MonacoTextEditor value={secret} onChange={setSecret} height="90px" language="plaintext" />
          <label style={{ color: '#cbd5e1', fontSize: 13 }}>
            <input type="checkbox" checked={secretIsBase64Url} onChange={(e) => setSecretIsBase64Url(e.target.checked)} style={{ marginRight: 8 }} />
            Secret is Base64URL encoded
          </label>
          <div className="tool-actions">
            <button className="tool-button" onClick={generate}>Generate JWT</button>
          </div>
          {error && <div style={{ color: '#fda4af' }}>{error}</div>}
          <label style={{ color: '#93c5fd', fontSize: 13 }}>Signed Token</label>
          <MonacoTextEditor value={token} readOnly height="180px" language="plaintext" />
        </section>
      </div>
    </div>
  )
}
