import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

function describeCron(expression: string): string {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) {
    throw new Error('Cron must have 5 fields: minute hour day-of-month month day-of-week')
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  return `Runs at minute "${minute}", hour "${hour}", day-of-month "${dayOfMonth}", month "${month}", day-of-week "${dayOfWeek}".`
}

export default function CronExpressionHelperTool() {
  const [expr, setExpr] = useState('0 9 * * 1-5')

  const result = useMemo(() => {
    try {
      return { description: describeCron(expr), error: '' }
    } catch (err) {
      return { description: '', error: (err as Error).message }
    }
  }, [expr])

  return (
    <div className="tool-shell">
      <h1>Cron Expression Helper</h1>
      <p>Validate 5-part cron expressions and get a quick readable description.</p>
      <section className="tool-card">
        <MonacoTextEditor value={expr} onChange={setExpr} height="90px" language="plaintext" />
        {result.error ? (
          <div style={{ color: '#fda4af', marginTop: 10 }}>{result.error}</div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <MonacoTextEditor value={result.description} readOnly height="120px" language="plaintext" />
          </div>
        )}
      </section>
    </div>
  )
}
