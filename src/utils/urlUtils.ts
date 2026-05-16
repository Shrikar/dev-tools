export function urlEncode(input: string){
  return encodeURIComponent(input)
}

export function urlDecode(input: string){
  try{ return decodeURIComponent(input) }
  catch { return 'Invalid input' }
}
