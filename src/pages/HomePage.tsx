export default function HomePage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to Dev Tools</h1>
      <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.75 }}>
        A set of privacy-first browser-only utilities for working with JSON, JWTs, Base64, hashes, UUIDs, URLs, and timestamps.
      </p>
      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        <div style={{ padding: '20px', borderRadius: '18px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Features</h2>
          <ul style={{ marginTop: '12px', paddingLeft: '18px', color: '#cbd5e1' }}>
            <li>Format and compare JSON</li>
            <li>Decode JWTs securely in the browser</li>
            <li>Encode/decode Base64</li>
            <li>Generate hashes and UUIDs</li>
            <li>Encode/decode URLs and convert timestamps</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
