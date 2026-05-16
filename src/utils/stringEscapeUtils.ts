import { validateJSON } from './jsonUtils'

export function escapeForJavaStringLiteral(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

export function unescapeJavaStringLiteral(value: string): string {
  const trimmed = value.trim()
  const unquoted =
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))
      ? trimmed.slice(1, -1)
      : trimmed

  return unquoted
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
}

export function jsonToEscapedJavaString(input: string): string {
  const parsed = validateJSON(input)
  const json = JSON.stringify(parsed)
  const escaped = escapeForJavaStringLiteral(json)
  return `"${escaped}"`
}

export function escapedJavaStringToPrettyJson(input: string): string {
  const unescaped = unescapeJavaStringLiteral(input)
  const parsed = JSON.parse(unescaped)
  return JSON.stringify(parsed, null, 2)
}
