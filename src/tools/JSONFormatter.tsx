import { useState } from 'react'
import { formatJSON, validateJSON } from '../utils/jsonUtils'

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleFormat() {
    setError(null)
    try {
      const parsed = validateJSON(input)
      setOutput(formatJSON(parsed))
    } catch (e: any) {
      setError(e.message)
      setOutput('')
    }
  }

  return (
    <div>
      <h1>JSON Formatter / Validator</h1>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={handleFormat}>Format / Validate</button>
      </div>
      {error ? <div style={{color:'red'}}>{error}</div> : <pre>{output}</pre>}
    </div>
  )
}
