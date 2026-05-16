const STORAGE_KEY = 'devtools.toolUsage'

type ToolUsageMap = Record<string, number>

export function getToolUsageMap(): ToolUsageMap {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ToolUsageMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function incrementToolUsage(path: string) {
  if (!path || path === '/' || typeof window === 'undefined') return

  const current = getToolUsageMap()
  current[path] = (current[path] ?? 0) + 1

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // ignore storage errors
  }
}

export function getToolUsageCount(path: string): number {
  return getToolUsageMap()[path] ?? 0
}
