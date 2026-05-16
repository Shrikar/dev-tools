import { useState } from 'react'
import { urlEncode, urlDecode } from '../utils/urlUtils'

export default function URLEncodeDecode(){
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')

  return (
    <div>
      <h1>URL Encode / Decode</h1>
      <textarea value={input} onChange={(e)=>setInput(e.target.value)} rows={4} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={()=>setOut(urlEncode(input))}>Encode</button>
        <button onClick={()=>setOut(urlDecode(input))} style={{marginLeft:8}}>Decode</button>
      </div>
      <pre style={{marginTop:8}}>{out}</pre>
    </div>
  )
}
