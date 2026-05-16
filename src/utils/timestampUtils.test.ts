import { describe, expect, it } from 'vitest'
import { fromISO, toISO } from './timestampUtils'

describe('timestampUtils', () => {
  it('converts epoch seconds to ISO', () => {
    expect(toISO('0')).toBe('1970-01-01T00:00:00.000Z')
  })

  it('handles invalid epoch input', () => {
    expect(toISO('abc')).toBe('Invalid epoch')
  })

  it('converts iso to epoch seconds', () => {
    expect(fromISO('1970-01-01T00:00:01.000Z')).toBe('1')
  })

  it('handles invalid date input', () => {
    expect(fromISO('nope')).toBe('Invalid date')
  })
})
