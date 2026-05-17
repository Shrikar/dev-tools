import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

const KEYWORDS = [
  'select', 'from', 'where', 'group by', 'order by', 'having', 'limit', 'offset', 'join', 'left join', 'right join', 'inner join', 'outer join',
  'on', 'and', 'or', 'insert into', 'values', 'update', 'set', 'delete from', 'union', 'union all',
]

function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, ' ').trim()
}

function uppercaseKeywords(sql: string) {
  let out = sql
  const sorted = [...KEYWORDS].sort((a, b) => b.length - a.length)
  for (const phrase of sorted) {
    const escaped = phrase.replace(/\s+/g, '\\s+')
    out = out.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), phrase.toUpperCase())
  }
  return out
}

function formatSql(input: string) {
  let sql = normalizeWhitespace(input)
  sql = uppercaseKeywords(sql)

  sql = sql
    .replace(/\bFROM\b/g, '\nFROM')
    .replace(/\bWHERE\b/g, '\nWHERE')
    .replace(/\bGROUP BY\b/g, '\nGROUP BY')
    .replace(/\bORDER BY\b/g, '\nORDER BY')
    .replace(/\bHAVING\b/g, '\nHAVING')
    .replace(/\bLIMIT\b/g, '\nLIMIT')
    .replace(/\bOFFSET\b/g, '\nOFFSET')
    .replace(/\b(INNER JOIN|LEFT JOIN|RIGHT JOIN|OUTER JOIN|JOIN)\b/g, '\n$1')
    .replace(/\bON\b/g, '\n  ON')
    .replace(/\bAND\b/g, '\n  AND')
    .replace(/\bOR\b/g, '\n  OR')
    .replace(/\bSET\b/g, '\nSET')
    .replace(/\bVALUES\b/g, '\nVALUES')
    .replace(/\s*,\s*/g, ', ')

  const statements = sql
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)

  return statements.map((statement) => `${statement};`).join('\n\n')
}

function lintSql(input: string): string[] {
  const sql = input.trim()
  if (!sql) return ['SQL input is empty.']

  const warnings: string[] = []
  const lower = sql.toLowerCase()

  if (/\bselect\s+\*/i.test(sql)) warnings.push('Avoid SELECT * in production queries.')
  if (/\bdelete\s+from\b/i.test(sql) && !/\bwhere\b/i.test(sql)) warnings.push('DELETE without WHERE can remove all rows.')
  if (/\bupdate\b/i.test(sql) && !/\bwhere\b/i.test(sql)) warnings.push('UPDATE without WHERE can modify all rows.')
  if (/\bdrop\s+table\b/i.test(sql)) warnings.push('DROP TABLE detected. Ensure this is intentional.')
  if (/\btruncate\b/i.test(sql)) warnings.push('TRUNCATE detected. This is destructive.')
  if (!/[;]\s*$/.test(sql)) warnings.push('Statement should end with a semicolon.')
  if (/\bwhere\s+1\s*=\s*1\b/i.test(sql)) warnings.push('WHERE 1=1 found. Remove before production if unnecessary.')
  if (/\s{2,}/.test(lower)) warnings.push('Multiple consecutive spaces detected. Consider formatting.')

  return warnings.length > 0 ? warnings : ['No basic lint warnings found.']
}

export default function SqlSuiteTool() {
  const [input, setInput] = useState('select * from posts where user_id = 1 order by id desc')
  const [output, setOutput] = useState('')

  const lintMessages = useMemo(() => lintSql(input), [input])

  const onFormat = () => {
    setOutput(formatSql(input))
  }

  const onMinify = () => {
    const min = normalizeWhitespace(uppercaseKeywords(input))
    setOutput(min.endsWith(';') ? min : `${min};`)
  }

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>SQL Suite</h1>
      <p>Format SQL and run basic safety/lint checks in the browser.</p>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">SQL input</label>
          <MonacoTextEditor value={input} onChange={setInput} height="56vh" language="sql" />
          <div className="tool-actions">
            <button className="tool-button" onClick={onFormat}>Format SQL</button>
            <button className="tool-button secondary" onClick={onMinify}>Minify SQL</button>
          </div>
        </section>

        <section style={{ display: 'grid', gap: 12 }}>
          <div className="tool-card">
            <label className="tool-label">Formatted output</label>
            <MonacoTextEditor value={output} readOnly height="34vh" language="sql" />
          </div>
          <div className="tool-card">
            <label className="tool-label">Basic lint checks</label>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#cbd5e1', lineHeight: 1.7 }}>
              {lintMessages.map((msg, index) => (
                <li key={`${msg}-${index}`}>{msg}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
