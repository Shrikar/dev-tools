import { useEffect, useMemo, useState } from 'react'
import JwtInputPanel from '../components/jwt/JwtInputPanel'
import DecodedJsonPanel from '../components/jwt/DecodedJsonPanel'
import SignatureVerificationPanel from '../components/jwt/SignatureVerificationPanel'
import { decodeBase64UrlToString, decodeBase64UrlToUint8Array, parseJwtParts, verifyHmacSha256 } from '../utils/jwtDecoderUtils'
import './JwtDecoderPage.css'

export default function JwtDecoderPage() {
  const [token, setToken] = useState('')
  const [secret, setSecret] = useState('')
  const [secretIsBase64Url, setSecretIsBase64Url] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'missing-secret' | 'unsupported-alg' | 'valid' | 'invalid' | 'not-attempted' | 'error'>('not-attempted')
  const [verificationMessage, setVerificationMessage] = useState('Signature verification is optional.')

  const parsedToken = useMemo(() => parseJwtParts(token), [token])

  const headerJson = useMemo(() => {
    if (!parsedToken.parts) return null
    try {
      const decoded = decodeBase64UrlToString(parsedToken.parts.header)
      return JSON.parse(decoded)
    } catch (error) {
      return { error: (error as Error).message }
    }
  }, [parsedToken.parts])

  const payloadJson = useMemo(() => {
    if (!parsedToken.parts) return null
    try {
      const decoded = decodeBase64UrlToString(parsedToken.parts.payload)
      return JSON.parse(decoded)
    } catch (error) {
      return { error: (error as Error).message }
    }
  }, [parsedToken.parts])

  const headerText = headerJson && !('error' in headerJson) ? JSON.stringify(headerJson, null, 2) : ''
  const payloadText = payloadJson && !('error' in payloadJson) ? JSON.stringify(payloadJson, null, 2) : ''

  const isTokenValid = Boolean(parsedToken.parts && !parsedToken.error && headerJson && payloadJson && !('error' in headerJson) && !('error' in payloadJson))

  useEffect(() => {
    let active = true
    async function verify() {
      if (!parsedToken.parts || parsedToken.error) {
        setVerificationStatus('not-attempted')
        setVerificationMessage('Enter a valid JWT to enable verification.')
        return
      }

      if (!secret) {
        setVerificationStatus('missing-secret')
        setVerificationMessage('Enter a secret to verify the signature.')
        return
      }

      if (parsedToken.alg !== 'HS256') {
        setVerificationStatus('unsupported-alg')
        setVerificationMessage(`Unsupported alg: ${parsedToken.alg ?? 'unknown'}. Only HS256 is supported.`)
        return
      }

      try {
        const secretKey = secretIsBase64Url
          ? decodeBase64UrlToUint8Array(secret)
          : new TextEncoder().encode(secret)

        const signed = await verifyHmacSha256(parsedToken.parts, secretKey)
        if (!active) return

        if (signed) {
          setVerificationStatus('valid')
          setVerificationMessage('Signature Verified')
        } else {
          setVerificationStatus('invalid')
          setVerificationMessage('Invalid Signature')
        }
      } catch (error) {
        setVerificationStatus('error')
        setVerificationMessage(`Verification error: ${(error as Error).message}`)
      }
    }

    verify()

    return () => {
      active = false
    }
  }, [parsedToken, secret, secretIsBase64Url])

  return (
    <div className="jwt-page">
      <div className="jwt-page-header">
        <div>
          <h1>JWT Debugger</h1>
          <p className="jwt-page-subtitle">
            Decode header and payload in the browser. Signature verification is optional and occurs locally.
          </p>
        </div>
        <div className="jwt-status-row">
          <div className="jwt-status-card">
            <span className="status-label">JWT status</span>
            <span className={`status-pill ${isTokenValid ? 'status-success' : 'status-warning'}`}>
              {isTokenValid ? 'Valid JWT' : 'Needs a valid token'}
            </span>
          </div>
        </div>
      </div>

      <div className="jwt-layout">
        <JwtInputPanel
          token={token}
          onTokenChange={setToken}
          invalidMessage={parsedToken.error}
          parts={parsedToken.parts}
        />

        <div className="jwt-right-column">
          <DecodedJsonPanel
            title="Decoded Header"
            jsonText={headerText}
            error={headerJson && 'error' in headerJson ? headerJson.error : undefined}
            copyText={headerText}
          />
          <DecodedJsonPanel
            title="Decoded Payload"
            jsonText={payloadText}
            error={payloadJson && 'error' in payloadJson ? payloadJson.error : undefined}
            copyText={payloadText}
          />
          <SignatureVerificationPanel
            alg={parsedToken.alg}
            status={verificationStatus}
            message={verificationMessage}
            secret={secret}
            onSecretChange={setSecret}
            secretIsBase64Url={secretIsBase64Url}
            onSecretBase64Toggle={setSecretIsBase64Url}
            hasValidJwt={isTokenValid}
          />
        </div>
      </div>
    </div>
  )
}
