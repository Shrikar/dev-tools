import { useState } from 'react'
import { decodeJWT } from '../utils/jwtUtils'

export default function JWTDecoder(){
  const [token, setToken] = useState('')
  const [payload, setPayload] = useState<any>(null)
  const [header, setHeader] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  function handleDecode(){
    setError(null)
    try{
      const { header: h, payload: p } = decodeJWT(token)
      setHeader(h)
      setPayload(p)
    }catch(e:any){
      setError(e.message)
      setHeader(null)
      setPayload(null)
    }
  }

  return (
    <div>
      <h1>JWT Decoder</h1>
      <textarea value={token} onChange={(e)=>setToken(e.target.value)} rows={4} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={handleDecode}>Decode</button>
      </div>
      {error && <div style={{color:'red'}}>{error}</div>}
      {header && <div>
        <h3>Header</h3>
        <pre>{JSON.stringify(header,null,2)}</pre>
      </div>}
      {payload && <div>
        <h3>Payload</h3>
        <pre>{JSON.stringify(payload,null,2)}</pre>
      </div>}
    </div>
  )
}
