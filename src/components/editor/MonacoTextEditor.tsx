import { useMemo, useRef, useState, type KeyboardEvent, type UIEvent } from 'react'

interface MonacoTextEditorProps {
  value: string
  onChange?: (value: string) => void
  height?: string
  language?: string
  readOnly?: boolean
}

function insertAtCursor(currentValue: string, start: number, end: number, insertText: string) {
  return `${currentValue.slice(0, start)}${insertText}${currentValue.slice(end)}`
}

export default function MonacoTextEditor({
  value,
  onChange,
  height = '240px',
  language: _language = 'plaintext',
  readOnly = false,
}: MonacoTextEditorProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const textRef = useRef<HTMLTextAreaElement | null>(null)

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, value.split('\n').length)
    return Array.from({ length: count }, (_, index) => index + 1).join('\n')
  }, [value])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return

    const target = event.currentTarget
    const start = target.selectionStart
    const end = target.selectionEnd

    if (event.key === 'Tab') {
      event.preventDefault()
      const nextValue = insertAtCursor(value, start, end, '  ')
      onChange?.(nextValue)
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2
      })
      return
    }

    if (event.key === 'Enter') {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const currentLine = value.slice(lineStart, start)
      const indent = currentLine.match(/^\s*/)?.[0] ?? ''

      event.preventDefault()
      const nextValue = insertAtCursor(value, start, end, `\n${indent}`)
      onChange?.(nextValue)
      requestAnimationFrame(() => {
        const cursor = start + 1 + indent.length
        target.selectionStart = target.selectionEnd = cursor
      })
    }
  }

  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  return (
    <div className="monaco-field" style={{ height }}>
      <div className="text-editor-wrap">
        <pre className="text-editor-gutter" style={{ transform: `translateY(-${scrollTop}px)` }}>
          {lineNumbers}
        </pre>
        <textarea
          ref={textRef}
          className="text-editor-area"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
