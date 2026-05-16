import { describe, expect, it } from 'vitest'
import { urlDecode, urlEncode } from './urlUtils'

describe('urlUtils', () => {
  it('encodes input', () => {
    expect(urlEncode('a b')).toBe('a%20b')
  })

  it('decodes input', () => {
    expect(urlDecode('a%20b')).toBe('a b')
  })

  it('handles invalid decode input', () => {
    expect(urlDecode('%')).toBe('Invalid input')
  })
})
