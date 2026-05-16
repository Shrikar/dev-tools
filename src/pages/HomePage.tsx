import { Link } from 'react-router-dom'
import { categories, standaloneTools } from '../config/tools'
import { getSubToolUsageCount } from '../utils/toolUsageStats'

const standaloneAsSubtools = standaloneTools.map((tool) => ({
  id: tool.id,
  name: tool.name,
  description: tool.description,
  path: tool.path,
}))

const groupedSubtools = categories.flatMap((category) =>
  category.tools.map((tool) => ({
    id: tool.id,
    name: `${category.name} · ${tool.name}`,
    description: tool.description,
    path: `${category.path}/${tool.slug}`,
  }))
)

const cards = [...groupedSubtools, ...standaloneAsSubtools]

export default function HomePage() {
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
          Local-first grouped suites for JSON/JWT/Cron plus standalone REST, encoding, hashing, and conversion workflows.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {cards.map((tool) => (
          <Link
            key={tool.id}
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
            <span style={{ fontSize: 12, color: '#93c5fd' }}>Used {getSubToolUsageCount(tool.id)} times</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
