import { describe, expect, it } from 'vitest'
import { formatHttpRequest, parseHttpRequest } from './httpRequestUtils'

describe('httpRequestUtils', () => {
  it('parses request with headers and body', () => {
    const parsed = parseHttpRequest('POST https://api.example.com/users\nContent-Type: application/json\nX-Test: 1\n\n{"name":"alice"}')
    expect(parsed.method).toBe('POST')
    expect(parsed.url).toBe('https://api.example.com/users')
    expect(parsed.headers['Content-Type']).toBe('application/json')
    expect(parsed.body).toBe('{"name":"alice"}')
  })

  it('formats request back to raw text', () => {
    const raw = formatHttpRequest({
      method: 'GET',
      url: 'https://api.example.com',
      headers: { Accept: 'application/json' },
      body: '',
    })
    expect(raw.startsWith('GET https://api.example.com')).toBe(true)
  })

  it('throws on invalid first line', () => {
    expect(() => parseHttpRequest('https://api.example.com')).toThrow('First line must be: METHOD URL')
  })
})
