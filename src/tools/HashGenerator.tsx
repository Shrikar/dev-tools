import { useState } from 'react'
import { sha256, sha512, md5 } from '../utils/hashUtils'

export default function HashGenerator(){
  const [input, setInput] = useState('')
  const [algo, setAlgo] = useState('sha256')
  const [out, setOut] = useState('')

  function gen(){
    if(algo==='sha256') setOut(sha256(input))
    else if(algo==='sha512') setOut(sha512(input))
    else setOut(md5(input))
  }

  return (
    <div>
      <h1>Hash Generator</h1>
      <textarea value={input} onChange={(e)=>setInput(e.target.value)} rows={4} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <select value={algo} onChange={(e)=>setAlgo(e.target.value)}>
          <option value="sha256">SHA-256</option>
          <option value="sha512">SHA-512</option>
          <option value="md5">MD5</option>
        </select>
        <button onClick={gen} style={{marginLeft:8}}>Generate</button>
      </div>
      <pre style={{marginTop:8}}>{out}</pre>
    </div>
  )
}
