function base64UrlDecode(str: string){
  // base64url -> base64
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  try{
    return JSON.parse(decodeURIComponent(escape(atob(str))))
  }catch{
    const globalAny = globalThis as any
    try{ return JSON.parse(globalAny.Buffer.from(str, 'base64').toString('utf8')) }catch(e){ throw new Error('Invalid JWT payload') }
  }
}

export function decodeJWT(token: string){
  if(!token) throw new Error('Empty token')
  const parts = token.split('.')
  if(parts.length<2) throw new Error('Invalid JWT format')
  const header = base64UrlDecode(parts[0])
  const payload = base64UrlDecode(parts[1])
  return { header, payload }
}
