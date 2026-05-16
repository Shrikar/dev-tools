import { useMemo, useState } from 'react'
import { formatJSON, validateJSON } from '../utils/jsonUtils'

const SAMPLE_LEFT = `{
  "name": "Alice",
  "role": "Engineer",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "items": [
    { "id": 1, "name": "keyboard" },
    { "id": 2, "name": "mouse" }
  ]
}`

const SAMPLE_RIGHT = `{
  "name": "Alice",
  "role": "Engineer",
  "preferences": {
    "theme": "light",
    "notifications": true
  },
  "items": [
    { "id": 1, "name": "keyboard" },
    { "id": 2, "name": "mouse" },
    { "id": 3, "name": "monitor" }
  ]
}`

interface ParseResult {
  value: any
  error?: string
}

interface CompareSummary {
  equal: boolean
  added: string[]
  removed: string[]
  changed: string[]
}

function parseInput(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { value: null, error: 'Enter JSON to compare.' }
  }

  try {
    return { value: validateJSON(input) }
  } catch (error) {
    return { value: null, error: (error as Error).message }
  }
}

function safeFormat(input: string) {
  try {
    return formatJSON(validateJSON(input))
  } catch {
    return input
  }
}

function safeMinify(input: string) {
  try {
    return JSON.stringify(validateJSON(input))
  } catch {
    return input
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function compareJSON(left: any, right: any): CompareSummary {
  const added: string[] = []
  const removed: string[] = []
  const changed: string[] = []

  function compareValue(a: any, b: any, path: string) {
    if (Object.is(a, b)) {
      return
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      compareArray(a, b, path)
      return
    }

    if (isObject(a) && isObject(b)) {
      compareObject(a, b, path)
      return
    }

    changed.push(path || 'root')
  }

  function compareArray(a: unknown[], b: unknown[], path: string) {
    const length = Math.max(a.length, b.length)
    for (let index = 0; index < length; index += 1) {
      const key = `${path}[${index}]`
      if (index >= a.length) {
        added.push(key)
      } else if (index >= b.length) {
        removed.push(key)
      } else {
        compareValue(a[index], b[index], key)
      }
    }
  }

  function compareObject(a: Record<string, unknown>, b: Record<string, unknown>, path: string) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    keys.forEach((key) => {
      const nextPath = path ? `${path}.${key}` : key
      if (!(key in a)) {
        added.push(nextPath)
        return
      }
      if (!(key in b)) {
        removed.push(nextPath)
        return
      }
      compareValue(a[key], b[key], nextPath)
    })
  }

  compareValue(left, right, '')

  return {
    equal: added.length === 0 && removed.length === 0 && changed.length === 0,
    added,
    removed,
    changed,
  }
}

function copyToClipboard(text: string) {
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(text).catch(() => {})
}

export default function JSONCompare() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [comparisonRequested, setComparisonRequested] = useState(false)
  const [summary, setSummary] = useState<CompareSummary | null>(null)

  const leftParse = useMemo(() => parseInput(left), [left])
  const rightParse = useMemo(() => parseInput(right), [right])
  const canCompare = !leftParse.error && !rightParse.error && left.trim() !== '' && right.trim() !== ''

  const handleCompare = () => {
    setComparisonRequested(true)
    if (!canCompare) {
      setSummary(null)
      return
    }

    setSummary(compareJSON(leftParse.value, rightParse.value))
  }

  const handleFormatLeft = () => {
    setLeft(safeFormat(left))
  }

  const handleFormatRight = () => {
    setRight(safeFormat(right))
  }

  const handleMinifyLeft = () => {
    setLeft(safeMinify(left))
  }

  const handleMinifyRight = () => {
    setRight(safeMinify(right))
  }

  const handleFormatBoth = () => {
    if (!leftParse.error) {
      setLeft(formatJSON(leftParse.value))
    }
    if (!rightParse.error) {
      setRight(formatJSON(rightParse.value))
    }
  }

  const handleMinifyBoth = () => {
    if (!leftParse.error) {
      setLeft(JSON.stringify(leftParse.value))
    }
    if (!rightParse.error) {
      setRight(JSON.stringify(rightParse.value))
    }
  }

  const handleLoadSampleLeft = () => setLeft(SAMPLE_LEFT)
  const handleLoadSampleRight = () => setRight(SAMPLE_RIGHT)
  const handleCopyLeft = () => {
    setRight(left)
  }
  const handleCopyRight = () => {
    setLeft(right)
  }

  const handleSwap = () => {
    setLeft(right)
    setRight(left)
    setSummary(null)
    setComparisonRequested(false)
  }

  const handleClearBoth = () => {
    setLeft('')
    setRight('')
    setSummary(null)
    setComparisonRequested(false)
  }

  return (
    <div className="json-compare-root">
      <div className="json-compare-header">
        <div>
          <h1>JSON Compare</h1>
          <p>Compare JSON payloads side-by-side and inspect added, removed, and changed keys without leaving the browser.</p>
        </div>
        <div className="json-compare-status">
          {comparisonRequested && summary ? (
            <div className={`json-summary-pill ${summary.equal ? 'json-summary-equal' : 'json-summary-different'}`}>
              {summary.equal ? 'Equal JSON' : 'Different JSON'}
            </div>
          ) : (
            <div className="json-summary-note">Use the compare button to inspect differences.</div>
          )}
        </div>
      </div>

      <div className="json-compare-workspace">
        <section className="json-editor-panel">
          <div className="json-editor-toolbar">
            <span className="json-editor-panel-title">JSON A</span>
            <button type="button" className="json-toolbar-button" onClick={handleFormatLeft}>
              Format
            </button>
            <button type="button" className="json-toolbar-button" onClick={handleMinifyLeft}>
              Minify
            </button>
            <button type="button" className="json-toolbar-button" onClick={() => setLeft('')}>
              Clear
            </button>
            <button type="button" className="json-toolbar-button" onClick={() => copyToClipboard(left)}>
              Copy
            </button>
            <button type="button" className="json-toolbar-button" onClick={handleLoadSampleLeft}>
              Load sample
            </button>
          </div>
          <textarea
            className="json-editor-textarea"
            value={left}
            onChange={(event) => setLeft(event.target.value)}
            placeholder="Enter JSON A"
          />
          {leftParse.error && <div className="json-error-banner">{leftParse.error}</div>}
        </section>

        <aside className="compare-actions">
          <button type="button" className="json-action-button" onClick={handleCopyLeft}>
            Copy left → right
          </button>
          <button type="button" className="json-action-button" onClick={handleCopyRight}>
            Copy right → left
          </button>
          <button type="button" className="json-action-button" onClick={handleFormatBoth}>
            Format both
          </button>
          <button type="button" className="json-action-button" onClick={handleMinifyBoth}>
            Minify both
          </button>
          <button type="button" className="json-action-button json-action-button--primary" onClick={handleCompare}>
            Compare
          </button>
          <button type="button" className="json-action-button" onClick={handleSwap}>
            Swap
          </button>
          <button type="button" className="json-action-button" onClick={handleClearBoth}>
            Clear both
          </button>
        </aside>

        <section className="json-editor-panel">
          <div className="json-editor-toolbar">
            <span className="json-editor-panel-title">JSON B</span>
            <button type="button" className="json-toolbar-button" onClick={handleFormatRight}>
              Format
            </button>
            <button type="button" className="json-toolbar-button" onClick={handleMinifyRight}>
              Minify
            </button>
            <button type="button" className="json-toolbar-button" onClick={() => setRight('')}>
              Clear
            </button>
            <button type="button" className="json-toolbar-button" onClick={() => copyToClipboard(right)}>
              Copy
            </button>
            <button type="button" className="json-toolbar-button" onClick={handleLoadSampleRight}>
              Load sample
            </button>
          </div>
          <textarea
            className="json-editor-textarea"
            value={right}
            onChange={(event) => setRight(event.target.value)}
            placeholder="Enter JSON B"
          />
          {rightParse.error && <div className="json-error-banner">{rightParse.error}</div>}
        </section>
      </div>

      <div className="diff-summary">
        <div className="diff-summary-header">
          <div>
            <h2>Diff summary</h2>
            <p>Review the comparison results and see the number of changed properties.</p>
          </div>
          {summary && (
            <div className="diff-summary-status">
              <span className={`json-summary-pill ${summary.equal ? 'json-summary-equal' : 'json-summary-different'}`}>
                {summary.equal ? 'Equal' : 'Different'}
              </span>
            </div>
          )}
        </div>

        {summary && (
          <div className="diff-highlight-panel">
            <div className="diff-highlight-item">
              <span>Status</span>
              <strong>{summary.equal ? 'Match' : 'Mismatch'}</strong>
            </div>
            <div className="diff-highlight-item">
              <span>Added</span>
              <strong>{summary.added.length}</strong>
            </div>
            <div className="diff-highlight-item">
              <span>Removed</span>
              <strong>{summary.removed.length}</strong>
            </div>
            <div className="diff-highlight-item">
              <span>Changed</span>
              <strong>{summary.changed.length}</strong>
            </div>
          </div>
        )}

        <div className="diff-summary-grid">
          <div className="diff-summary-card">
            <span className="diff-summary-label">Status</span>
            <strong>{comparisonRequested ? (summary ? (summary.equal ? 'Equal' : 'Different') : 'Invalid JSON') : 'Ready to compare'}</strong>
          </div>
          <div className="diff-summary-card">
            <span className="diff-summary-label">Added keys</span>
            <strong>{summary ? summary.added.length : 0}</strong>
          </div>
          <div className="diff-summary-card">
            <span className="diff-summary-label">Removed keys</span>
            <strong>{summary ? summary.removed.length : 0}</strong>
          </div>
          <div className="diff-summary-card">
            <span className="diff-summary-label">Changed values</span>
            <strong>{summary ? summary.changed.length : 0}</strong>
          </div>
        </div>

        {summary && (summary.added.length || summary.removed.length || summary.changed.length) ? (
          <div className="diff-summary-list">
            {summary.added.length > 0 && (
              <div>
                <div className="diff-summary-list-title">Added keys</div>
                <ul>
                  {summary.added.slice(0, 12).map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.removed.length > 0 && (
              <div>
                <div className="diff-summary-list-title">Removed keys</div>
                <ul>
                  {summary.removed.slice(0, 12).map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.changed.length > 0 && (
              <div>
                <div className="diff-summary-list-title">Changed values</div>
                <ul>
                  {summary.changed.slice(0, 12).map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : comparisonRequested && summary ? (
          <div className="diff-summary-message">No structural differences were found between the two JSON objects.</div>
        ) : null}
      </div>
    </div>
  )
}
