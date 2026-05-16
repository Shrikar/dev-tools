export interface JwtParts {
  header: string
  payload: string
  signature: string
}

export function parseJwtParts(token: string): { parts: JwtParts | null; alg: string | null; error?: string } {
  const trimmed = token.trim()
  if (!trimmed) {
    return { parts: null, alg: null, error: 'JWT is empty.' }
  }

  const segments = trimmed.split('.')
  if (segments.length !== 3) {
    return { parts: null, alg: null, error: 'JWT must contain three parts separated by dots.' }
  }

  const [header, payload, signature] = segments
  if (!header || !payload || !signature) {
    return { parts: null, alg: null, error: 'JWT parts cannot be empty.' }
  }

  let alg: string | null = null
  try {
    const decodedHeader = JSON.parse(decodeBase64UrlToString(header))
    alg = typeof decodedHeader.alg === 'string' ? decodedHeader.alg : null
  } catch {
    // ignore header parse failure here; decode process will handle errors separately
  }

  return {
    parts: { header, payload, signature },
    alg,
  }
}

export function normalizeBase64Url(input: string): string {
  return input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
}

export function decodeBase64UrlToString(input: string): string {
  const normalized = normalizeBase64Url(input)
  try {
    const binary = atob(normalized)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch (error) {
    throw new Error('Invalid Base64URL encoding')
  }
}

export function decodeBase64UrlToUint8Array(input: string): Uint8Array {
  const normalized = normalizeBase64Url(input)
  try {
    const binary = atob(normalized)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  } catch {
    throw new Error('Invalid Base64URL encoding')
  }
}

export function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function verifyHmacSha256(parts: JwtParts, secretKey: ArrayBuffer | Uint8Array): Promise<boolean> {
  const data = new TextEncoder().encode(`${parts.header}.${parts.payload}`)
  const cryptoKey = await crypto.subtle.importKey('raw', secretKey as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
  const computed = base64UrlEncode(signature)
  const expected = parts.signature.replace(/=+$/, '')
  return computed === expected
}
