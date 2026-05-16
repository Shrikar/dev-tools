import { useState } from 'react'
import { base64Encode, base64Decode } from '../utils/base64'

export default function Base64Tool(){
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')

  return (
    <div>
      <h1>Base64 Encode / Decode</h1>
      <textarea value={input} onChange={(e)=>setInput(e.target.value)} rows={6} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={()=>setOut(base64Encode(input))}>Encode</button>
        <button onClick={()=>setOut(base64Decode(input))} style={{marginLeft:8}}>Decode</button>
      </div>
      <pre style={{marginTop:8}}>{out}</pre>
    </div>
  )
}
