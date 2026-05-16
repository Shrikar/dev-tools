export function validateJSON(input: string) {
  const trimmed = input.trim()
  if (!trimmed) {
    throw new Error('JSON input is empty.')
  }
  return JSON.parse(trimmed)
}

export function formatJSON(obj: unknown) {
  return JSON.stringify(obj, null, 2)
}

export function minifyJSON(obj: unknown) {
  return JSON.stringify(obj)
}

function sortRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortRecursively)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortRecursively((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }

  return value
}

export function sortJSONKeys(obj: unknown) {
  return sortRecursively(obj)
}
