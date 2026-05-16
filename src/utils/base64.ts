export function base64Encode(input: string){
  try{
    return btoa(unescape(encodeURIComponent(input)))
  }catch(e){
    // fallback for Node-like env
    return Buffer.from(input, 'utf8').toString('base64')
  }
}

export function base64Decode(input: string){
  try{
    return decodeURIComponent(escape(atob(input)))
  }catch(e){
    return Buffer.from(input, 'base64').toString('utf8')
  }
}
