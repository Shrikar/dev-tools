const globalAny = globalThis as any
const hasBuffer = typeof globalAny.Buffer !== 'undefined'

export function base64Encode(input: string){
  if (hasBuffer) {
    return globalAny.Buffer.from(input, 'utf8').toString('base64')
  }

  return btoa(unescape(encodeURIComponent(input)))
}

export function base64Decode(input: string){
  if (hasBuffer) {
    return globalAny.Buffer.from(input, 'base64').toString('utf8')
  }

  return decodeURIComponent(escape(atob(input)))
}
