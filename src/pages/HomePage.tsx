import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, standaloneTools } from '../config/tools'
import { getSubToolLastUsedAt, getSubToolUsageCount } from '../utils/toolUsageStats'

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
const SORT_STORAGE_KEY = 'devtools.home.sort'
type SortMode = 'default' | 'most-used' | 'recently-used'

export default function HomePage() {
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    if (typeof window === 'undefined') return 'default'
    const stored = window.localStorage.getItem(SORT_STORAGE_KEY)
    if (stored === 'most-used' || stored === 'recently-used') return stored
    return 'default'
  })

  const sortedCards = useMemo(() => {
    const withCounts = cards.map((tool) => ({
      ...tool,
      usage: getSubToolUsageCount(tool.id),
      lastUsedAt: getSubToolLastUsedAt(tool.id),
    }))

    if (sortMode === 'most-used') {
      return [...withCounts].sort((a, b) => {
        if (b.usage !== a.usage) return b.usage - a.usage
        return a.name.localeCompare(b.name)
      })
    }

    if (sortMode === 'recently-used') {
      return [...withCounts].sort((a, b) => {
        if (b.lastUsedAt !== a.lastUsedAt) return b.lastUsedAt - a.lastUsedAt
        if (b.usage !== a.usage) return b.usage - a.usage
        return a.name.localeCompare(b.name)
      })
    }

    return [...withCounts].sort((a, b) => a.name.localeCompare(b.name))
  }, [sortMode])

  const onChangeSort = (next: SortMode) => {
    setSortMode(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SORT_STORAGE_KEY, next)
    }
  }

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

      <section style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>Sort:</span>
        <button className={`tool-button${sortMode === 'default' ? '' : ' secondary'}`} onClick={() => onChangeSort('default')}>
          Default (A-Z)
        </button>
        <button className={`tool-button${sortMode === 'most-used' ? '' : ' secondary'}`} onClick={() => onChangeSort('most-used')}>
          Most Used
        </button>
        <button className={`tool-button${sortMode === 'recently-used' ? '' : ' secondary'}`} onClick={() => onChangeSort('recently-used')}>
          Recently Used
        </button>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {sortedCards.map((tool) => (
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
            <span style={{ fontSize: 12, color: '#93c5fd' }}>Used {tool.usage} times</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
