import MonacoTextEditor from '../editor/MonacoTextEditor'
import StatusBadge from './StatusBadge'

interface SignatureVerificationPanelProps {
  alg?: string | null
  status: 'idle' | 'missing-secret' | 'unsupported-alg' | 'valid' | 'invalid' | 'not-attempted' | 'error'
  message: string
  secret: string
  onSecretChange: (value: string) => void
  secretIsBase64Url: boolean
  onSecretBase64Toggle: (value: boolean) => void
  hasValidJwt: boolean
}

export default function SignatureVerificationPanel({
  alg,
  status,
  message,
  secret,
  onSecretChange,
  secretIsBase64Url,
  onSecretBase64Toggle,
  hasValidJwt,
}: SignatureVerificationPanelProps) {
  const statusType = status === 'valid' ? 'success' : status === 'invalid' || status === 'error' ? 'error' : 'warning'

  return (
    <div className="jwt-panel">
      <div className="jwt-panel-header">
        <div>
          <h2 className="jwt-panel-title">Signature Verification</h2>
          <span className="jwt-tab">Verify</span>
        </div>
        <StatusBadge type={statusType}>{message}</StatusBadge>
      </div>

      <div className="jwt-info-line">
        <strong>Algorithm:</strong> {alg ?? 'unknown'}
      </div>
      <div className="jwt-info-line">
        {hasValidJwt ? 'Signature verification is computed locally in your browser.' : 'A valid JWT decode is required to verify signatures.'}
      </div>

      <div className="jwt-small-textarea">
        <MonacoTextEditor
          value={secret}
          onChange={onSecretChange}
          language="plaintext"
          height="120px"
        />
      </div>

      <div className="jwt-button-row">
        <label className="jwt-button" style={{ alignItems: 'center', display: 'inline-flex' }}>
          <input
            type="checkbox"
            checked={secretIsBase64Url}
            onChange={(event) => onSecretBase64Toggle(event.target.checked)}
            style={{ marginRight: 8 }}
          />
          Base64URL Encoded Secret
        </label>
      </div>
    </div>
  )
}
