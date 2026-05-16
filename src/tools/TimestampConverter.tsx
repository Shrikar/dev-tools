import { useState } from 'react'
import { toISO, fromISO } from '../utils/timestampUtils'

export default function TimestampConverter(){
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')

  return (
    <div>
      <h1>Timestamp Converter</h1>
      <input value={input} onChange={(e)=>setInput(e.target.value)} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={()=>setOut(toISO(input))}>Epoch {'→'} ISO</button>
        <button onClick={()=>setOut(fromISO(input))} style={{marginLeft:8}}>ISO {'→'} Epoch</button>
      </div>
      <pre style={{marginTop:8}}>{out}</pre>
    </div>
  )
}
