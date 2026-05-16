import StatusBadge from './StatusBadge'

interface DecodedJsonPanelProps {
  title: string
  jsonText: string
  error?: string
  copyText: string
}

export default function DecodedJsonPanel({ title, jsonText, error, copyText }: DecodedJsonPanelProps) {
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
    } catch {
      // ignore
    }
  }

  return (
    <div className="jwt-panel">
      <div className="jwt-panel-header">
        <div>
          <h2 className="jwt-panel-title">{title}</h2>
          <span className="jwt-tab">JSON</span>
        </div>
        <button className="jwt-button" type="button" onClick={copyJson}>
          Copy
        </button>
      </div>
      {error ? (
        <>
          <StatusBadge type="error">{error}</StatusBadge>
          <div className="jwt-panel-error">
            <p className="jwt-error-message">The JWT segment could not be decoded as valid JSON.</p>
          </div>
        </>
      ) : (
        <pre>{jsonText || 'No JSON decoded yet.'}</pre>
      )}
    </div>
  )
}
