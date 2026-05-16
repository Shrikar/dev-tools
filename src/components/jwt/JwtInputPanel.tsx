import { useMemo } from 'react'
import StatusBadge from './StatusBadge'

interface JwtInputPanelProps {
  token: string
  onTokenChange: (value: string) => void
  invalidMessage?: string
  parts: { header: string; payload: string; signature: string } | null
}

export default function JwtInputPanel({ token, onTokenChange, invalidMessage, parts }: JwtInputPanelProps) {
  const partPreview = useMemo(() => {
    if (!parts) return null
    const shorten = (value: string) => `${value.slice(0, 12)}${value.length > 12 ? '…' : ''}`
    return {
      header: shorten(parts.header),
      payload: shorten(parts.payload),
      signature: shorten(parts.signature),
    }
  }, [parts])

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token)
    } catch {
      // ignore silently
    }
  }

  return (
    <div className="jwt-panel">
      <div className="jwt-panel-header">
        <div>
          <h2 className="jwt-panel-title">JWT Input</h2>
          <span className="jwt-tab">Token</span>
        </div>
        <div className="jwt-button-row">
          <button className="jwt-button" type="button" onClick={copyToken}>
            Copy
          </button>
          <button className="jwt-button" type="button" onClick={() => onTokenChange('')}>
            Clear
          </button>
        </div>
      </div>

      <textarea
        className="jwt-textarea"
        value={token}
        onChange={(event) => onTokenChange(event.target.value)}
        placeholder="Paste your JWT here"
      />

      <div className="jwt-chip-row">
        <span className={`jwt-chip ${parts ? 'header' : 'invalid'}`}>Header</span>
        <span className={`jwt-chip ${parts ? 'payload' : 'invalid'}`}>Payload</span>
        <span className={`jwt-chip ${parts ? 'signature' : 'invalid'}`}>Signature</span>
      </div>

      {parts && partPreview ? (
        <div className="jwt-info-line">
          <strong>Header:</strong> {partPreview.header} · <strong>Payload:</strong> {partPreview.payload} · <strong>Signature:</strong>{' '}
          {partPreview.signature}
        </div>
      ) : (
        <div className="jwt-error-message">{invalidMessage ?? 'JWT must contain header.payload.signature'}</div>
      )}
      {!parts && invalidMessage && <StatusBadge type="error">{invalidMessage}</StatusBadge>}
    </div>
  )
}
