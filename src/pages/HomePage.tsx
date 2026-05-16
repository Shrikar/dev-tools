import { Link } from 'react-router-dom'
import { tools } from '../config/tools'
import { getToolUsageCount } from '../utils/toolUsageStats'

export default function HomePage() {
  const featured = tools.filter((tool) => tool.path !== '/')

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section
        style={{
          border: '1px solid rgba(148, 163, 184, 0.22)',
          borderRadius: 18,
          padding: 24,
          background: 'linear-gradient(130deg, #111827 0%, #1f2937 60%, #0c4a6e 100%)',
        }}
      >
        <h1 style={{ fontSize: '2.1rem', margin: 0 }}>Developer Utility Hub</h1>
        <p style={{ color: '#cbd5e1', marginTop: 10, maxWidth: 800 }}>
          Local-first utilities for JWT, hashing, JSON formatting/compare, Base64, UUID, URL, and timestamp workflows.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {featured.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            style={{
              textDecoration: 'none',
              borderRadius: 14,
              border: '1px solid rgba(148, 163, 184, 0.16)',
              background: '#0f172a',
              color: '#e2e8f0',
              padding: 14,
              display: 'grid',
              gap: 6,
            }}
          >
            <strong>{tool.name}</strong>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{tool.description}</span>
            <span style={{ fontSize: 12, color: '#93c5fd' }}>Used {getToolUsageCount(tool.path)} times</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
