import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { standaloneTools, categories } from '../config/tools'
import { base64Decode, base64Encode } from '../utils/base64'
import { md5, sha256, sha512 } from '../utils/hashUtils'
import { formatJSON, minifyJSON, validateJSON } from '../utils/jsonUtils'
import './tool-shell.css'

type Line = { id: string; type: 'input' | 'output' | 'error'; text: string }

const routeLookup: Record<string, string> = {
  home: '/',
  json: '/json/formatter',
  jwt: '/jwt/decoder',
  cron: '/cron/builder',
  api: '/api/curl-converter',
  rest: '/rest-client',
  yaml: '/yaml-json-converter',
  base64: '/base64',
  hash: '/hash-generator',
  uuid: '/uuid-generator',
  url: '/url-encode-decode',
  time: '/timestamp-converter',
}

function helpText() {
  return [
    'Commands:',
    '  help',
    '  clear',
    '  tools',
    '  ls',
    '  pwd',
    '  date',
    '  cd <path>',
    '  cat <name>',
    '  open <name|path>',
    '  now',
    '  uuid',
    '  hash <md5|sha256|sha512> <text>',
    '  b64 encode <text>',
    '  b64 decode <base64>',
    '  json format <json>',
    '  json minify <json>',
  ].join('\n')
}

export default function ShellTool() {
  const navigate = useNavigate()
  const [command, setCommand] = useState('')
  const [cwd, setCwd] = useState('/dev-tools')
  const [history, setHistory] = useState<Line[]>([
    { id: crypto.randomUUID(), type: 'output', text: 'Dev Tools Shell\nType `help` to list commands.' },
  ])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const toolsText = useMemo(() => {
    const grouped = categories.map((category) => `${category.name}: ${category.tools.map((tool) => tool.slug).join(', ')}`)
    const standalone = standaloneTools.map((tool) => `${tool.name}: ${tool.path}`)
    return [...grouped, ...standalone].join('\n')
  }, [])

  const lsText = useMemo(() => {
    const suiteNames = categories.map((category) => category.name.replace(' Suite', '').toLowerCase())
    const toolNames = standaloneTools.map((tool) => tool.name.toLowerCase().replace(/\s+/g, '-'))
    return [...suiteNames, ...toolNames, 'README'].join('  ')
  }, [])

  const append = (type: Line['type'], text: string) => {
    setHistory((prev) => [...prev, { id: crypto.randomUUID(), type, text }])
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }

  const runCommand = () => {
    const raw = command.trim()
    if (!raw) return

    append('input', `$ ${raw}`)
    setCommand('')

    try {
      if (raw === 'help') {
        append('output', helpText())
        return
      }

      if (raw === 'clear') {
        setHistory([])
        return
      }

      if (raw === 'tools') {
        append('output', toolsText)
        return
      }

      if (raw === 'ls') {
        append('output', lsText)
        return
      }

      if (raw === 'pwd') {
        append('output', cwd)
        return
      }

      if (raw === 'date' || raw === 'now') {
        append('output', new Date().toString())
        return
      }

      if (raw.startsWith('cd ')) {
        const target = raw.slice(3).trim()
        if (!target || target === '~') {
          setCwd('/dev-tools')
          append('output', '')
          return
        }
        if (target === '/' || target === '/dev-tools') {
          setCwd('/dev-tools')
          append('output', '')
          return
        }
        throw new Error('Browser shell uses a virtual filesystem. Supported: cd /dev-tools')
      }

      if (raw.startsWith('cat ')) {
        const target = raw.slice(4).trim().toLowerCase()
        if (target === 'readme' || target === 'readme.md') {
          append('output', 'Dev Tools browser shell\n- local simulation only\n- no real OS/process/file access\nUse `open <tool>` to navigate.')
          return
        }
        throw new Error('Only virtual files are available. Try: cat README')
      }

      if (raw === 'uuid') {
        append('output', crypto.randomUUID())
        return
      }

      if (raw.startsWith('open ')) {
        const target = raw.slice(5).trim().toLowerCase()
        const route = target.startsWith('/') ? target : routeLookup[target]
        if (!route) throw new Error('Unknown tool or route. Try `tools`.')
        navigate(route)
        append('output', `Navigated to ${route}`)
        return
      }

      if (raw.startsWith('hash ')) {
        const parts = raw.split(' ')
        if (parts.length < 3) throw new Error('Usage: hash <md5|sha256|sha512> <text>')
        const algo = parts[1]
        const text = raw.slice(`hash ${algo} `.length)
        if (algo === 'md5') append('output', md5(text))
        else if (algo === 'sha256') append('output', sha256(text))
        else if (algo === 'sha512') append('output', sha512(text))
        else throw new Error('Unsupported hash. Use md5, sha256, or sha512.')
        return
      }

      if (raw.startsWith('b64 encode ')) {
        append('output', base64Encode(raw.slice('b64 encode '.length)))
        return
      }

      if (raw.startsWith('b64 decode ')) {
        append('output', base64Decode(raw.slice('b64 decode '.length)))
        return
      }

      if (raw.startsWith('json format ')) {
        const parsed = validateJSON(raw.slice('json format '.length))
        append('output', formatJSON(parsed))
        return
      }

      if (raw.startsWith('json minify ')) {
        const parsed = validateJSON(raw.slice('json minify '.length))
        append('output', minifyJSON(parsed))
        return
      }

      throw new Error('Unknown command. Type `help`.')
    } catch (err) {
      append('error', (err as Error).message)
    }
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>Dev Shell</h1>
      <p>Terminal-style interface for quick tool navigation and transformations.</p>

      <section className="tool-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.12)', color: '#93c5fd', fontSize: 13 }}>
          shell@dev-tools
        </div>
        <div
          ref={scrollRef}
          style={{
            height: '68vh',
            overflow: 'auto',
            padding: 12,
            background: '#050b18',
            fontFamily: 'IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {history.map((line) => (
            <pre
              key={line.id}
              style={{
                margin: '0 0 8px',
                whiteSpace: 'pre-wrap',
                color: line.type === 'error' ? '#fca5a5' : line.type === 'input' ? '#93c5fd' : '#e2e8f0',
              }}
            >
              {line.text}
            </pre>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, padding: 12, borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <input
            className="tool-input"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runCommand()
            }}
            placeholder="Type command..."
          />
          <button className="tool-button" onClick={runCommand}>Run</button>
        </div>
      </section>
    </div>
  )
}
