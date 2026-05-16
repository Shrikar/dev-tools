import Editor from '@monaco-editor/react'

interface MonacoTextEditorProps {
  value: string
  onChange?: (value: string) => void
  height?: string
  language?: string
  readOnly?: boolean
}

export default function MonacoTextEditor({
  value,
  onChange,
  height = '240px',
  language = 'plaintext',
  readOnly = false,
}: MonacoTextEditorProps) {
  return (
    <div className="monaco-field" style={{ height }}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={(nextValue) => onChange?.(nextValue ?? '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          readOnly,
          fontSize: 13,
          fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  )
}
