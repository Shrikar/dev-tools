import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

type ParsedCurl = {
  method: string
  url: string
  headers: Array<[string, string]>
  body: string
}

function splitShellArgs(input: string): string[] {
  const args: string[] = []
  let current = ''
  let quote: 'single' | 'double' | null = null

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]
    if (quote === 'single') {
      if (ch === "'") quote = null
      else current += ch
      continue
    }
    if (quote === 'double') {
      if (ch === '"') quote = null
      else if (ch === '\\' && i + 1 < input.length) {
        i += 1
        current += input[i]
      } else current += ch
      continue
    }
    if (ch === "'") {
      quote = 'single'
      continue
    }
    if (ch === '"') {
      quote = 'double'
      continue
    }
    if (/\s/.test(ch)) {
      if (current) {
        args.push(current)
        current = ''
      }
      continue
    }
    if (ch === '\\' && i + 1 < input.length) {
      i += 1
      current += input[i]
      continue
    }
    current += ch
  }

  if (current) args.push(current)
  return args
}

function parseCurl(input: string): ParsedCurl {
  const args = splitShellArgs(input.trim())
  if (args.length === 0) throw new Error('Paste a cURL command.')
  if (args[0] !== 'curl') throw new Error('Command should start with curl.')

  let method = 'GET'
  const headers: Array<[string, string]> = []
  let body = ''
  let url = ''

  for (let i = 1; i < args.length; i += 1) {
    const arg = args[i]
    const next = i + 1 < args.length ? args[i + 1] : ''

    if (arg === '-X' || arg === '--request') {
      method = next.toUpperCase()
      i += 1
      continue
    }
    if (arg === '-H' || arg === '--header') {
      const sep = next.indexOf(':')
      if (sep > 0) {
        headers.push([next.slice(0, sep).trim(), next.slice(sep + 1).trim()])
      }
      i += 1
      continue
    }
    if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '--data-binary') {
      body = next
      i += 1
      continue
    }

    if (/^https?:\/\//i.test(arg)) {
      url = arg
    }
  }

  if (!url) throw new Error('No URL found in command.')
  if (body && method === 'GET') method = 'POST'

  return { method, url, headers, body }
}

function toFetchSnippet(parsed: ParsedCurl) {
  const headersObject = parsed.headers.reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = value
    return acc
  }, {})

  const lines = [
    `fetch(${JSON.stringify(parsed.url)}, {`,
    `  method: '${parsed.method}',`,
    `  headers: ${JSON.stringify(headersObject, null, 2).replace(/\n/g, '\n  ')},`,
  ]

  if (parsed.body) lines.push(`  body: ${JSON.stringify(parsed.body)},`)
  lines.push('})', '  .then((response) => response.text())', '  .then((body) => console.log(body))', '  .catch((error) => console.error(error))')
  return lines.join('\n')
}

function toHttpie(parsed: ParsedCurl) {
  const method = parsed.method.toLowerCase()
  const headers = parsed.headers.map(([key, value]) => `${key}:${value}`).join(' ')
  const body = parsed.body ? ` '${parsed.body}'` : ''
  return `http ${method} ${parsed.url}${headers ? ` ${headers}` : ''}${body}`
}

export default function CurlConverterTool() {
  const [curlInput, setCurlInput] = useState(`curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name":"Ada"}'`)

  const parsed = useMemo(() => {
    try {
      return { value: parseCurl(curlInput), error: '' }
    } catch (err) {
      return { value: null, error: (err as Error).message }
    }
  }, [curlInput])

  const fetchOutput = parsed.value ? toFetchSnippet(parsed.value) : ''
  const httpieOutput = parsed.value ? toHttpie(parsed.value) : ''

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h2>cURL ↔ fetch ↔ HTTPie</h2>
      <p>Convert cURL commands into browser fetch snippets and HTTPie commands.</p>
      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">cURL input</label>
          <MonacoTextEditor value={curlInput} onChange={setCurlInput} height="58vh" language="plaintext" />
          {parsed.error && <div style={{ color: '#fda4af', marginTop: 10 }}>{parsed.error}</div>}
        </section>
        <section style={{ display: 'grid', gap: 12 }}>
          <div className="tool-card">
            <label className="tool-label">fetch output</label>
            <MonacoTextEditor value={fetchOutput} readOnly height="27vh" language="javascript" />
          </div>
          <div className="tool-card">
            <label className="tool-label">HTTPie output</label>
            <MonacoTextEditor value={httpieOutput} readOnly height="27vh" language="plaintext" />
          </div>
        </section>
      </div>
    </div>
  )
}
