export interface ParsedHttpRequest {
  method: string
  url: string
  headers: Record<string, string>
  body: string
}

const METHOD_RE = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)$/i

export function parseHttpRequest(raw: string): ParsedHttpRequest {
  const normalized = raw.replace(/\r/g, '')
  const lines = normalized.split('\n')

  const firstLine = lines[0]?.trim()
  if (!firstLine) {
    throw new Error('HTTP request is empty.')
  }

  const match = firstLine.match(METHOD_RE)
  if (!match) {
    throw new Error('First line must be: METHOD URL')
  }

  const method = match[1].toUpperCase()
  const url = match[2]

  const headers: Record<string, string> = {}
  let index = 1

  while (index < lines.length) {
    const line = lines[index]
    if (line.trim() === '') {
      index += 1
      break
    }

    const colonIndex = line.indexOf(':')
    if (colonIndex <= 0) {
      throw new Error(`Invalid header line: ${line}`)
    }

    const name = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()
    if (!name) {
      throw new Error(`Invalid header line: ${line}`)
    }
    headers[name] = value
    index += 1
  }

  const body = lines.slice(index).join('\n')

  return { method, url, headers, body }
}

export function formatHttpRequest(request: ParsedHttpRequest): string {
  const headerLines = Object.entries(request.headers).map(([name, value]) => `${name}: ${value}`)
  const bodySuffix = request.body ? `\n\n${request.body}` : '\n'
  return `${request.method.toUpperCase()} ${request.url}\n${headerLines.join('\n')}${bodySuffix}`
}
