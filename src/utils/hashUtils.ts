import CryptoJS from 'crypto-js'

export function sha256(input: string){
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex)
}

export function sha512(input: string){
  return CryptoJS.SHA512(input).toString(CryptoJS.enc.Hex)
}

export function md5(input: string){
  return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex)
}
