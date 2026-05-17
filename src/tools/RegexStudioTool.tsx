import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

interface MatchRow {
  index: number
  match: string
  groups: string[]
}

export default function RegexStudioTool() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b')
  const [flags, setFlags] = useState('g')
  const [input, setInput] = useState('Contact us at team@example.com or hello@devtools.io')
  const [replaceText, setReplaceText] = useState('[redacted-email]')

  const analysis = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags)
      const source = flags.includes('g') ? regex : new RegExp(pattern, `${flags}g`)
      const matches: MatchRow[] = []

      for (const item of input.matchAll(source)) {
        matches.push({
          index: item.index ?? -1,
          match: item[0] ?? '',
          groups: item.slice(1),
        })
      }

      const replacementPreview = input.replace(regex, replaceText)
      return { regex, matches, replacementPreview, error: '' }
    } catch (err) {
      return {
        regex: null,
        matches: [],
        replacementPreview: '',
        error: (err as Error).message,
      }
    }
  }, [pattern, flags, input, replaceText])

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>Regex Studio</h1>
      <p>Test JavaScript regex patterns with flags, captured groups, and replace preview.</p>

      <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'minmax(0, 1fr) 120px' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Pattern</span>
            <input className="tool-input" value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="\\bword\\b" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Flags</span>
            <input className="tool-input" value={flags} onChange={(event) => setFlags(event.target.value)} placeholder="gim" />
          </label>
        </div>

        {analysis.error && <div style={{ color: '#fca5a5' }}>Regex error: {analysis.error}</div>}
      </section>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">Test text</label>
          <MonacoTextEditor value={input} onChange={setInput} height="44vh" language="plaintext" />
        </section>

        <section style={{ display: 'grid', gap: 12 }}>
          <div className="tool-card">
            <label className="tool-label">Replace with</label>
            <input className="tool-input" value={replaceText} onChange={(event) => setReplaceText(event.target.value)} placeholder="replacement" />
            <label className="tool-label" style={{ marginTop: 10 }}>Replace preview</label>
            <MonacoTextEditor value={analysis.replacementPreview} readOnly height="20vh" language="plaintext" />
          </div>

          <div className="tool-card" style={{ display: 'grid', gap: 8 }}>
            <div style={{ color: '#93c5fd', fontSize: 13 }}>Matches: {analysis.matches.length}</div>
            <div style={{ maxHeight: '20vh', overflow: 'auto', display: 'grid', gap: 8 }}>
              {analysis.matches.map((item, index) => (
                <div key={`${item.index}-${index}`} style={{ border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 8, padding: 8, background: '#0b1120' }}>
                  <div style={{ color: '#93c5fd', fontSize: 12 }}>#{index + 1} at index {item.index}</div>
                  <div style={{ color: '#e2e8f0', fontFamily: 'IBM Plex Mono, ui-monospace, monospace', fontSize: 13 }}>{item.match || '(empty match)'}</div>
                  {item.groups.length > 0 && (
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                      Groups: {item.groups.map((group, groupIndex) => `$${groupIndex + 1}=${group ?? ''}`).join(' | ')}
                    </div>
                  )}
                </div>
              ))}
              {analysis.matches.length === 0 && !analysis.error && <div style={{ color: '#94a3b8' }}>No matches found.</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
