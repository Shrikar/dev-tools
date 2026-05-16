import { useState } from 'react'
import { validateJSON } from '../utils/jsonUtils'

export default function JSONCompare() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [result, setResult] = useState<string | null>(null)

  function compare() {
    try {
      const a = validateJSON(left)
      const b = validateJSON(right)
      const equal = JSON.stringify(a) === JSON.stringify(b)
      setResult(equal ? 'Equal' : 'Different')
    } catch (e: any) {
      setResult('Invalid JSON: ' + e.message)
    }
  }

  return (
    <div>
      <h1>JSON Compare</h1>
      <div style={{display:'flex', gap:8}}>
        <textarea value={left} onChange={(e)=>setLeft(e.target.value)} rows={10} style={{flex:1}} />
        <textarea value={right} onChange={(e)=>setRight(e.target.value)} rows={10} style={{flex:1}} />
      </div>
      <div style={{marginTop:8}}>
        <button onClick={compare}>Compare</button>
      </div>
      {result && <div style={{marginTop:8}}>{result}</div>}
    </div>
  )
}
