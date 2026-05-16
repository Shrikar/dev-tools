import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

interface ParsedCron {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

function parseCron(expression: string): ParsedCron {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) {
    throw new Error('Cron must have 5 fields: minute hour day-of-month month day-of-week')
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  return { minute, hour, dayOfMonth, month, dayOfWeek }
}

function describeCron(parsed: ParsedCron): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = parsed
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute'
  }
  if (hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `At minute ${minute}, every hour`
  }
  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}, every day`
  }
  if (dayOfMonth === '*' && month === '*') {
    return `At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}, on weekday(s) ${dayOfWeek}`
  }
  return `At minute ${minute}, hour ${hour}, day-of-month ${dayOfMonth}, month ${month}, day-of-week ${dayOfWeek}`
}

function parseDayOfWeekSet(value: string): number[] | null {
  if (value === '*') return [0, 1, 2, 3, 4, 5, 6]
  if (/^\d$/.test(value)) return [Number(value)]
  const range = value.match(/^(\d)-(\d)$/)
  if (range) {
    const start = Number(range[1])
    const end = Number(range[2])
    if (start <= end) return Array.from({ length: end - start + 1 }, (_, idx) => start + idx)
  }
  return null
}

function nextRuns(parsed: ParsedCron): string[] {
  const minute = Number(parsed.minute)
  const hour = Number(parsed.hour)
  if (Number.isNaN(minute) || Number.isNaN(hour)) return []
  if (parsed.dayOfMonth !== '*' || parsed.month !== '*') return []

  const weekdays = parseDayOfWeekSet(parsed.dayOfWeek)
  if (!weekdays) return []

  const results: string[] = []
  const cursor = new Date()
  cursor.setSeconds(0, 0)

  for (let i = 0; i < 60 && results.length < 5; i += 1) {
    cursor.setDate(cursor.getDate() + (i === 0 ? 0 : 1))
    cursor.setHours(hour, minute, 0, 0)
    if (cursor.getTime() <= Date.now()) continue
    if (!weekdays.includes(cursor.getDay())) continue
    results.push(cursor.toLocaleString())
  }

  return results
}

export default function CronExpressionHelperTool() {
  const [exprInput, setExprInput] = useState('0 9 * * 1-5')
  const [parsedExpr, setParsedExpr] = useState('0 9 * * 1-5')

  const result = useMemo(() => {
    try {
      const parsed = parseCron(parsedExpr)
      return {
        parsed,
        description: describeCron(parsed),
        next: nextRuns(parsed),
        error: '',
      }
    } catch (err) {
      return {
        parsed: null,
        description: '',
        next: [] as string[],
        error: (err as Error).message,
      }
    }
  }, [parsedExpr])

  return (
    <div className="tool-shell">
      <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
        <label style={{ color: '#cbd5e1' }}>Enter cron expression</label>
        <MonacoTextEditor value={exprInput} onChange={setExprInput} height="70px" language="plaintext" />
        <div className="tool-actions" style={{ marginTop: 0 }}>
          <button className="tool-button" onClick={() => setParsedExpr(exprInput)}>Parse</button>
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>Standard 5-field format: minute hour day-of-month month day-of-week</div>
      </section>

      <section className="tool-card" style={{ display: 'grid', gap: 14 }}>
        {result.error ? (
          <div style={{ color: '#fda4af' }}>{result.error}</div>
        ) : (
          <>
            <div>
              <div style={{ color: '#cbd5e1', marginBottom: 8 }}>This schedule means</div>
              <div style={{ color: '#e2e8f0', fontSize: 28, lineHeight: 1.2 }}>{result.description}</div>
            </div>

            {result.parsed && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10 }}>
                {[
                  ['Minute', result.parsed.minute],
                  ['Hour', result.parsed.hour],
                  ['Day (M)', result.parsed.dayOfMonth],
                  ['Month', result.parsed.month],
                  ['Day (W)', result.parsed.dayOfWeek],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#0b1120' }}>
                    <div style={{ color: '#60a5fa', fontSize: 28, fontFamily: 'IBM Plex Mono, monospace' }}>{value}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{label}</div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div style={{ color: '#cbd5e1', marginBottom: 8 }}>Next 5 run times</div>
              {result.next.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, color: '#94a3b8' }}>
                  {result.next.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#94a3b8' }}>Unable to calculate next runs for this expression.</div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
