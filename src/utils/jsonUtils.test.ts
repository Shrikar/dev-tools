import { describe, expect, it } from 'vitest'
import { formatJSON, minifyJSON, sortJSONKeys, validateJSON } from './jsonUtils'

describe('jsonUtils', () => {
  it('parses valid json', () => {
    expect(validateJSON('{"a":1}')).toEqual({ a: 1 })
  })

  it('throws for empty input', () => {
    expect(() => validateJSON('   ')).toThrow('JSON input is empty.')
  })

  it('formats JSON with indentation', () => {
    expect(formatJSON({ a: 1 })).toBe(`{
  "a": 1
}`)
  })

  it('minifies JSON', () => {
    expect(minifyJSON({ a: 1, b: [1, 2] })).toBe('{"a":1,"b":[1,2]}')
  })

  it('sorts keys recursively', () => {
    const sorted = sortJSONKeys({ b: 1, a: { d: 2, c: 1 } })
    expect(sorted).toEqual({ a: { c: 1, d: 2 }, b: 1 })
  })
})
