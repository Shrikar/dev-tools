import { useMemo, useState } from 'react'
import { parse as parseYaml } from 'yaml'

type JsonLike = null | boolean | number | string | JsonLike[] | { [key: string]: JsonLike }

interface CollapsibleDataViewProps {
  input: string
  mode: 'json' | 'yaml'
}

function parseInput(input: string, mode: 'json' | 'yaml'): JsonLike {
  if (mode === 'json') return JSON.parse(input) as JsonLike
  return parseYaml(input) as JsonLike
}

function isExpandable(value: JsonLike): value is JsonLike[] | { [key: string]: JsonLike } {
  return typeof value === 'object' && value !== null
}

function valueLabel(value: JsonLike): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `Array(${value.length})`
  if (typeof value === 'object') return `Object(${Object.keys(value).length})`
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

interface NodeProps {
  node: JsonLike
  path: string
  collapsed: Record<string, boolean>
  onToggle: (path: string) => void
}

function Node({ node, path, collapsed, onToggle }: NodeProps) {
  if (!isExpandable(node)) {
    return <span style={{ color: '#cbd5e1' }}>{valueLabel(node)}</span>
  }

  const entries = Array.isArray(node)
    ? node.map((value, index) => [String(index), value] as const)
    : Object.entries(node)

  return (
    <ul style={{ listStyle: 'none', margin: 0, paddingLeft: path ? 14 : 0 }}>
      {entries.map(([key, value]) => {
        const childPath = path ? `${path}.${key}` : key
        const collapsedNode = collapsed[childPath] ?? false

        return (
          <li key={childPath} style={{ margin: '4px 0' }}>
            <button
              type="button"
              onClick={() => isExpandable(value) && onToggle(childPath)}
              style={{
                border: '1px solid #334155',
                background: '#0b1120',
                color: '#e2e8f0',
                borderRadius: 8,
                padding: '2px 8px',
                cursor: isExpandable(value) ? 'pointer' : 'default',
                marginRight: 8,
                fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
              }}
            >
              {isExpandable(value) ? (collapsedNode ? '+' : '-') : '•'} {Array.isArray(node) ? `[${key}]` : key}
            </button>

            {isExpandable(value) ? (
              collapsedNode ? (
                <span style={{ color: '#94a3b8' }}>{valueLabel(value)}</span>
              ) : (
                <Node node={value} path={childPath} collapsed={collapsed} onToggle={onToggle} />
              )
            ) : (
              <span style={{ color: '#94a3b8' }}>{valueLabel(value)}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default function CollapsibleDataView({ input, mode }: CollapsibleDataViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const parsed = useMemo(() => {
    try {
      return { value: parseInput(input, mode), error: '' }
    } catch (err) {
      return { value: null as JsonLike, error: (err as Error).message }
    }
  }, [input, mode])

  if (!input.trim()) return null
  if (parsed.error) return null

  return (
    <div className="tool-card" style={{ marginTop: 10 }}>
      <div style={{ color: '#93c5fd', fontSize: 13, marginBottom: 8 }}>Collapsible view</div>
      <Node
        node={parsed.value}
        path=""
        collapsed={collapsed}
        onToggle={(path) => setCollapsed((prev) => ({ ...prev, [path]: !prev[path] }))}
      />
    </div>
  )
}
