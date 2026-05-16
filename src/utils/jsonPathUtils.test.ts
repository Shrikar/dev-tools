import { describe, expect, it } from 'vitest'
import { composePath, resolveJsonPath, tokenizePath } from './jsonPathUtils'

describe('jsonPathUtils', () => {
  it('tokenizes dot and index paths', () => {
    expect(tokenizePath('a.b[2].c')).toEqual(['a', 'b', '2', 'c'])
  })

  it('resolves path values', () => {
    const input = { a: { b: [{ c: 'ok' }] } }
    expect(resolveJsonPath(input, 'a.b[0].c')).toBe('ok')
  })

  it('throws when path does not exist', () => {
    expect(() => resolveJsonPath({ a: 1 }, 'a.b')).toThrow('Path not found: a.b')
  })

  it('composes selection path', () => {
    expect(composePath(['users', '0'], 'name')).toBe('users[0].name')
  })
})
