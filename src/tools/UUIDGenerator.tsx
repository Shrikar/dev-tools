import { useState } from 'react'

export default function UUIDGenerator(){
  const [out, setOut] = useState('')

  function gen(){
    const id = (crypto as any)?.randomUUID?.() ?? 'UNSUPPORTED'
    setOut(id)
  }

  return (
    <div>
      <h1>UUID Generator</h1>
      <div>
        <button onClick={gen}>Generate UUID</button>
      </div>
      <pre style={{marginTop:8}}>{out}</pre>
    </div>
  )
}
