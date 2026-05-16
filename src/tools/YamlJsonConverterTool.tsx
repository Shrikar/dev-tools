import { useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import CollapsibleDataView from '../components/json/CollapsibleDataView'
import { formatJson, formatYaml, jsonToYaml, yamlToJson } from '../utils/yamlUtils'
import './tool-shell.css'

export default function YamlJsonConverterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [outputMode, setOutputMode] = useState<'json' | 'yaml'>('json')

  const runYamlToJson = () => {
    setError('')
    try {
      const parsed = yamlToJson(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setOutputMode('json')
    } catch (err) {
      setOutput('')
      setError((err as Error).message)
    }
  }

  const runJsonToYaml = () => {
    setError('')
    try {
      setOutput(jsonToYaml(input))
      setOutputMode('yaml')
    } catch (err) {
      setOutput('')
      setError((err as Error).message)
    }
  }

  const formatInputAsJson = () => {
    setError('')
    try {
      setInput(formatJson(input))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const formatInputAsYaml = () => {
    setError('')
    try {
      setInput(formatYaml(input))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="tool-shell">
      <h1>YAML ↔ JSON Converter</h1>
      <p>Convert between YAML and JSON with normalized formatting.</p>
      <div className="tool-grid">
        <section className="tool-card">
          <MonacoTextEditor value={input} onChange={setInput} height="72vh" language="yaml" />
          <div className="tool-actions">
            <button className="tool-button" onClick={runYamlToJson}>YAML → JSON</button>
            <button className="tool-button secondary" onClick={runJsonToYaml}>JSON → YAML</button>
            <button className="tool-button secondary" onClick={formatInputAsJson}>Format JSON</button>
            <button className="tool-button secondary" onClick={formatInputAsYaml}>Format YAML</button>
          </div>
          {error && <div style={{ color: '#fda4af', marginTop: 10 }}>{error}</div>}
        </section>
        <section>
          <div className="tool-card">
            <MonacoTextEditor value={output} readOnly height="72vh" language={outputMode === 'json' ? 'json' : 'yaml'} />
          </div>
          <CollapsibleDataView input={output} mode={outputMode} />
        </section>
      </div>
    </div>
  )
}
