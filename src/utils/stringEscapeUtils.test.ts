import { describe, expect, it } from 'vitest'
import {
  escapeForJavaStringLiteral,
  escapedJavaStringToPrettyJson,
  jsonToEscapedJavaString,
  unescapeJavaStringLiteral,
} from './stringEscapeUtils'

describe('stringEscapeUtils', () => {
  it('escapes quotes and backslashes for java literals', () => {
    expect(escapeForJavaStringLiteral('{"a":"x\\y"}')).toBe('{\\"a\\":\\"x\\\\y\\"}')
  })

  it('converts json to escaped java string literal', () => {
    expect(jsonToEscapedJavaString('{"name":"alice"}')).toBe('"{\\"name\\":\\"alice\\"}"')
  })

  it('unescapes java string literal', () => {
    expect(unescapeJavaStringLiteral('"{\\"name\\":\\"alice\\"}"')).toBe('{"name":"alice"}')
  })

  it('converts escaped java string to pretty json', () => {
    expect(escapedJavaStringToPrettyJson('"{\\"name\\":\\"alice\\"}"')).toBe(`{
  "name": "alice"
}`)
  })
})
