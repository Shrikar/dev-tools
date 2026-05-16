export function tokenizePath(path: string): string[] {
  const trimmed = path.trim()
  if (!trimmed) {
    return []
  }

  const tokens: string[] = []
  let buffer = ''

  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i]

    if (char === '.') {
      if (buffer) {
        tokens.push(buffer)
        buffer = ''
      }
      continue
    }

    if (char === '[') {
      if (buffer) {
        tokens.push(buffer)
        buffer = ''
      }
      let j = i + 1
      let indexValue = ''
      while (j < trimmed.length && trimmed[j] !== ']') {
        indexValue += trimmed[j]
        j += 1
      }
      if (indexValue) {
        tokens.push(indexValue)
      }
      i = j
      continue
    }

    buffer += char
  }

  if (buffer) {
    tokens.push(buffer)
  }

  return tokens
}

function isIndexable(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function resolveJsonPath(input: unknown, path: string): unknown {
  const tokens = tokenizePath(path)
  if (tokens.length === 0) {
    return input
  }

  let cursor: unknown = input
  for (const token of tokens) {
    if (!isIndexable(cursor) || !(token in cursor)) {
      throw new Error(`Path not found: ${path}`)
    }
    cursor = cursor[token]
  }

  return cursor
}

export function composePath(namespace: string[], name: string | null): string {
  const segments = [...namespace]
  if (name !== null && name !== undefined) {
    segments.push(name)
  }

  return segments
    .map((segment, index) => {
      if (/^\d+$/.test(segment)) {
        return `[${segment}]`
      }
      return index === 0 ? segment : `.${segment}`
    })
    .join('')
}
